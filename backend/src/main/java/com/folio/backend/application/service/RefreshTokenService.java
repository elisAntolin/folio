package com.folio.backend.application.service;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.folio.backend.infrastructure.repository.RefreshTokenRepository;
import com.folio.backend.infrastructure.repository.UserRepository;

@Service
public class RefreshTokenService {
    private static final Duration TOKEN_LIFETIME = Duration.ofDays(7);

    private final RefreshTokenRepository repository;
    private final UserRepository users;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository, UserRepository users) {
        this.repository = repository;
        this.users = users;
    }

    public SessionToken createRefreshToken(UUID userId) {
        return issue(userId, UUID.randomUUID(), Instant.now().plus(TOKEN_LIFETIME));
    }

    private SessionToken issue(UUID userId, UUID sessionId, Instant expiresAt) {
        String token = generateRefreshToken();
        repository.save(userId, sessionId, hashToken(token), expiresAt);
        return new SessionToken(userId, sessionId, token);
    }

    @Transactional
    public Optional<SessionToken> rotateRefreshToken(String rawToken, UUID expectedSessionId) {
        String tokenHash = hashToken(rawToken);
        var storedToken = repository.findByTokenHash(tokenHash).orElse(null);
        if (storedToken == null) {
            return Optional.empty();
        }
        requireSession(expectedSessionId, storedToken.sessionId());
        if (!users.lockById(storedToken.userId())) {
            return Optional.empty();
        }

        // The user row serializes rotation and revocation, including password changes.
        if (!repository.revokeIfActive(tokenHash)) {
            repository.revokeBySessionId(storedToken.sessionId());
            return Optional.empty();
        }

        return Optional.of(issue(storedToken.userId(), storedToken.sessionId(), storedToken.expiresAt()));
    }

    @Transactional
    public void revokeRefreshToken(String rawToken, UUID expectedSessionId) {
        repository.findByTokenHash(hashToken(rawToken)).ifPresent(token -> {
            requireSession(expectedSessionId, token.sessionId());
            if (users.lockById(token.userId())) {
                repository.revokeBySessionId(token.sessionId());
            }
        });
    }

    public void revokeRefreshTokensByUserId(UUID userId) {
        repository.revokeByUserId(userId);
    }

    private void requireSession(UUID expected, UUID actual) {
        if (expected != null && !expected.equals(actual)) {
            throw new SessionMismatch();
        }
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

    public record SessionToken(UUID userId, UUID sessionId, String value) {
    }

    public static final class SessionMismatch extends RuntimeException {
    }
}
