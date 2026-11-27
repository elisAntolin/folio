package com.folio.backend.infrastructure.repository;

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

    public void save(UUID id, UUID userId, String tokenHash, java.time.Instant expiresAt) {
        jdbc.update(
            "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
            id,
            userId,
            tokenHash,
            OffsetDateTime.ofInstant(expiresAt, ZoneOffset.UTC)
        );
    }

    public Optional<RefreshToken> findByTokenHash(String tokenHash) {
        List<RefreshToken> tokens = jdbc.query(
            "SELECT id, user_id, token_hash, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ?",
            (rs, rowNum) -> {
                OffsetDateTime revokedAt = rs.getObject("revoked_at", OffsetDateTime.class);
                return new RefreshToken(
                    rs.getObject("id", UUID.class),
                    rs.getObject("user_id", UUID.class),
                    rs.getString("token_hash"),
                    rs.getObject("expires_at", OffsetDateTime.class).toInstant(),
                    revokedAt == null ? null : revokedAt.toInstant()
                );
            },
            tokenHash
        );
        return tokens.stream().findFirst();
    }

    public boolean revokeIfActive(String tokenHash) {
        return jdbc.update(
            "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP " +
                "WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP",
            tokenHash
        ) == 1;
    }

    public void revokeByTokenHash(String tokenHash) {
        jdbc.update(
            "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP " +
                "WHERE token_hash = ? AND revoked_at IS NULL",
            tokenHash
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
