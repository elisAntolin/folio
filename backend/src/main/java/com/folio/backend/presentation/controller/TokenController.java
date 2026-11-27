package com.folio.backend.presentation.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.folio.backend.application.service.RefreshTokenService;
import com.folio.backend.application.service.JwtService;
import com.folio.backend.infrastructure.repository.UserRepository;
import com.folio.backend.domain.model.User;
import org.springframework.web.server.ResponseStatusException;

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
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> request) {
        String token = requiredRefreshToken(request);
        RefreshTokenService.RotatedRefreshToken rotated = refreshTokenService.rotateRefreshToken(token);
        String email = userRepository.findEmailById(rotated.userId());
        String accessToken = jwtService.generateToken(email);
        return ResponseEntity.ok(Map.of(
            "accessToken", accessToken,
            "refreshToken", rotated.refreshToken()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody Map<String, String> request) {
        refreshTokenService.revokeRefreshToken(requiredRefreshToken(request));
        return ResponseEntity.noContent().build();
    }

    private String requiredRefreshToken(Map<String, String> request) {
        if (request == null || request.get("refreshToken") == null || request.get("refreshToken").isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token é obrigatório");
        }
        return request.get("refreshToken");
    }
}