package com.folio.backend.infrastructure.repository;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.folio.backend.domain.model.RefreshToken;

@Repository
public class RefreshTokenRepository {
    private final JdbcTemplate jdbc;

    public RefreshTokenRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void save(UUID userId, UUID sessionId, String tokenHash, Instant expiresAt) {
        jdbc.update(
            "INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
            userId,
            sessionId,
            tokenHash,
            OffsetDateTime.ofInstant(expiresAt, ZoneOffset.UTC)
        );
    }

    public Optional<RefreshToken> findByTokenHash(String tokenHash) {
        List<RefreshToken> tokens = jdbc.query(
            "SELECT user_id, family_id, expires_at FROM refresh_tokens WHERE token_hash = ?",
            (rs, rowNum) -> new RefreshToken(
                    rs.getObject("user_id", UUID.class),
                    rs.getObject("family_id", UUID.class),
                    rs.getObject("expires_at", OffsetDateTime.class).toInstant()
                ),
            tokenHash
        );
        return tokens.stream().findFirst();
    }

    public boolean revokeIfActive(String tokenHash) {
        return jdbc.update(
            "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP " +
                "WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > clock_timestamp()",
            tokenHash
        ) == 1;
    }

    public void revokeBySessionId(UUID sessionId) {
        jdbc.update(
            "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP " +
                "WHERE family_id = ? AND revoked_at IS NULL",
            sessionId
        );
    }

    public void revokeByUserId(UUID userId) {
        jdbc.update(
            "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP " +
                "WHERE user_id = ? AND revoked_at IS NULL",
            userId
        );
    }
}
