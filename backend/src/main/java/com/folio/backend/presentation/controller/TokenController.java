package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.JwtService;
import com.folio.backend.application.service.RefreshTokenService;
import com.folio.backend.infrastructure.repository.UserRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/tokens")
public class TokenController {
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public TokenController(
            RefreshTokenService refreshTokenService,
            JwtService jwtService,
            UserRepository userRepository) {
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/refresh")
    public ResponseEntity<SessionResponse> refresh(
            @CookieValue(name = SessionResponse.COOKIE_NAME, required = false) String token,
            @RequestHeader(name = "X-Folio-Session", required = false) UUID expectedSessionId) {
        if (token == null || token.isBlank()) {
            return SessionResponse.clear(HttpStatus.UNAUTHORIZED).build();
        }
        return refreshTokenService.rotateRefreshToken(token, expectedSessionId).map(rotated -> {
            String email = userRepository.findEmailById(rotated.userId());
            return SessionResponse.issue(HttpStatus.OK, jwtService.generateToken(email), email, rotated);
        }).orElseGet(() -> SessionResponse.clear(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = SessionResponse.COOKIE_NAME, required = false) String token,
            @RequestHeader("X-Folio-Session") UUID expectedSessionId) {
        if (token != null && !token.isBlank()) {
            refreshTokenService.revokeRefreshToken(token, expectedSessionId);
        }
        return SessionResponse.clear(HttpStatus.NO_CONTENT).build();
    }

    @ExceptionHandler(RefreshTokenService.SessionMismatch.class)
    ResponseEntity<Void> sessionMismatch() {
        return ResponseEntity.status(HttpStatus.CONFLICT).cacheControl(CacheControl.noStore()).build();
    }
}
