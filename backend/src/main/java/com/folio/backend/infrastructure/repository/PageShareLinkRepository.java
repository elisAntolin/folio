package com.folio.backend.infrastructure.repository;

import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.application.sharing.PageShareLink;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PageShareLinkRepository {
    private final JdbcTemplate jdbc;
    private static final String COLUMNS = "id, role, expires_at, revoked_at, created_at";

    public PageShareLinkRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<PageShareLink> list(UUID pageId) {
        return jdbc.query("SELECT " + COLUMNS + " FROM page_share_links WHERE page_id = ? ORDER BY created_at DESC",
                (rs, row) -> map(rs), pageId);
    }

    public PageShareLink create(UUID pageId, UUID actor, String role, String hash, Instant expiresAt) {
        return jdbc.queryForObject("""
                INSERT INTO page_share_links (page_id, created_by, role, token_hash, expires_at)
                VALUES (?, ?, ?, ?, ?) RETURNING
                """ + COLUMNS, (rs, row) -> map(rs), pageId, actor, role, hash, timestamp(expiresAt));
    }

    public boolean change(UUID pageId, UUID linkId, String role, Instant expiresAt) {
        return jdbc.update("""
                UPDATE page_share_links SET role = ?, expires_at = ?
                WHERE page_id = ? AND id = ? AND revoked_at IS NULL
                """, role, timestamp(expiresAt), pageId, linkId) > 0;
    }

    public boolean revoke(UUID pageId, UUID linkId) {
        return jdbc.update("""
                UPDATE page_share_links SET revoked_at = CURRENT_TIMESTAMP
                WHERE page_id = ? AND id = ? AND revoked_at IS NULL
                """, pageId, linkId) > 0;
    }

    public void revokeAll(UUID pageId) {
        jdbc.update("""
                UPDATE page_share_links SET revoked_at = CURRENT_TIMESTAMP
                WHERE page_id = ? AND revoked_at IS NULL
                """, pageId);
    }

    public Optional<PageShareLink.Target> find(String hash) {
        return jdbc.query("""
                SELECT sl.id, sl.role, sl.expires_at, sl.revoked_at, sl.created_at, sl.page_id,
                       p.title, p.cover_image_url
                FROM page_share_links sl JOIN pages p ON p.id = sl.page_id
                WHERE sl.token_hash = ? AND p.deleted_at IS NULL
                """, (rs, row) -> new PageShareLink.Target(rs.getObject("page_id", UUID.class),
                rs.getString("title"), rs.getString("cover_image_url"), map(rs)), hash).stream().findFirst();
    }

    private static PageShareLink map(ResultSet rs) throws SQLException {
        return new PageShareLink(rs.getObject("id", UUID.class), PageAccessLevel.fromRole(rs.getString("role")),
                instant(rs.getTimestamp("expires_at")), instant(rs.getTimestamp("revoked_at")),
                instant(rs.getTimestamp("created_at")));
    }

    private static Instant instant(Timestamp time) { return time == null ? null : time.toInstant(); }
    private static Timestamp timestamp(Instant time) { return time == null ? null : Timestamp.from(time); }
}
