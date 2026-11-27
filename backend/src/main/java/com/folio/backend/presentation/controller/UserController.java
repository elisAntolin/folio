package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.UserService;
import com.folio.backend.application.service.JwtService;
import com.folio.backend.application.service.RefreshTokenService;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.folio.backend.domain.model.User;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;


@RestController 
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public UserController(UserService userService, JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<Map<String, String>> createUser(@RequestBody Map<String, String> user) {
        String email = required(user, "email", "E-mail é obrigatório");
        String password = required(user, "password", "Senha é obrigatória");
        String confirmPassword = required(user, "confirmPassword", "Confirmação de senha é obrigatória");
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter pelo menos 8 caracteres");
        }
        if (!password.equals(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas não coincidem");
        }

        User createdUser = userService.createUser(email, password);
        return ResponseEntity.status(HttpStatus.CREATED).body(issueTokens(createdUser));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody Map<String, String> user) {
        String email = required(user, "email", "E-mail é obrigatório");
        String password = required(user, "password", "Senha é obrigatória");
        User authenticatedUser = userService.authenticateUser(email, password);
        return ResponseEntity.ok(issueTokens(authenticatedUser));
    }

    @PatchMapping("/updatePassword")
    public ResponseEntity<String> updatePassword(
            @RequestBody Map<String, String> user,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        String password = required(user, "password", "Senha é obrigatória");
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter pelo menos 8 caracteres");
        }

        userService.updateUserPassword(authenticatedUser.email(), password);
        refreshTokenService.revokeRefreshTokensByUserId(authenticatedUser.id());
        return ResponseEntity.status(HttpStatus.OK).body("Senha atualizada com sucesso");
    }

    private Map<String, String> issueTokens(User user) {
        String accessToken = jwtService.generateToken(user.getEmail());
        String refreshToken = refreshTokenService.createRefreshToken(user.getId());
        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
    }

    private String required(Map<String, String> request, String field, String message) {
        if (request == null || request.get(field) == null || request.get(field).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return request.get(field).trim();
    }
}
