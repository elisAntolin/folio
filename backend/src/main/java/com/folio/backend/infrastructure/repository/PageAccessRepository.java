package com.folio.backend.infrastructure.repository;

import com.folio.backend.application.sharing.PageAccessLevel;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class PageAccessRepository {
    private final JdbcTemplate jdbc;

    public PageAccessRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public boolean lockPage(UUID pageId) {
        return lockPageOwner(pageId).isPresent();
    }

    public Optional<UUID> lockPageOwner(UUID pageId) {
        return jdbc.query("SELECT owner_user_id FROM pages WHERE id = ? AND deleted_at IS NULL FOR UPDATE",
                (rs, row) -> rs.getObject(1, UUID.class), pageId).stream().findFirst();
    }

    public Optional<PageAccessLevel> find(UUID pageId, UUID userId) {
        return jdbc.query("""
                SELECT p.owner_user_id, pp.role
                FROM pages p LEFT JOIN page_permissions pp ON pp.page_id = p.id AND pp.user_id = ?
                WHERE p.id = ? AND p.deleted_at IS NULL
                  AND (p.owner_user_id = ? OR pp.user_id IS NOT NULL)
                """, (rs, row) -> userId.equals(rs.getObject("owner_user_id", UUID.class))
                ? PageAccessLevel.OWNER : PageAccessLevel.fromRole(rs.getString("role")),
                userId, pageId, userId).stream().findFirst();
    }
}
