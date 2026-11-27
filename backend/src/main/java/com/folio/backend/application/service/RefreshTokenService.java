package com.folio.backend.application.service;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.Duration;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.folio.backend.infrastructure.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {
    private static final Duration TOKEN_LIFETIME = Duration.ofDays(7);

    private final RefreshTokenRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    public String createRefreshToken(UUID userId) {
        String token = generateRefreshToken();
        repository.save(
            UUID.randomUUID(),
            userId,
            hashToken(token),
            Instant.now().plus(TOKEN_LIFETIME)
        );
        return token;
    }

    @Transactional
    public RotatedRefreshToken rotateRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        var storedToken = repository.findByTokenHash(tokenHash)
            .orElseThrow(this::invalidRefreshToken);

        if (!repository.revokeIfActive(tokenHash)) {
            throw invalidRefreshToken();
        }

        return new RotatedRefreshToken(storedToken.userId(), createRefreshToken(storedToken.userId()));
    }

    public void revokeRefreshToken(String rawToken) {
        repository.revokeByTokenHash(hashToken(rawToken));
    }

    public void revokeRefreshTokensByUserId(UUID userId) {
        repository.revokeByUserId(userId);
    }

    static String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String generateRefreshToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private ResponseStatusException invalidRefreshToken() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido ou expirado");
    }

    public record RotatedRefreshToken(UUID userId, String refreshToken) {
    }
}