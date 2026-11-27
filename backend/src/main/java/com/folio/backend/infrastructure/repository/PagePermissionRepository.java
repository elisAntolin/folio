package com.folio.backend.infrastructure.repository;

import com.folio.backend.application.sharing.PageAccessLevel;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PagePermissionRepository {
    public record Member(UUID userId, String email, PageAccessLevel permission) {}

    private final JdbcTemplate jdbc;
    public PagePermissionRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Optional<UUID> findRecipient(String email) {
        return jdbc.query("SELECT id FROM users WHERE email = ?", (rs, row) -> rs.getObject(1, UUID.class),
                email).stream().findFirst();
    }

    public List<Member> list(UUID pageId) {
        return jdbc.query("""
                SELECT u.id, u.email, NULL AS role
                FROM pages p JOIN users u ON u.id = p.owner_user_id WHERE p.id = ?
                UNION ALL
                SELECT u.id, u.email, pp.role
                FROM page_permissions pp JOIN users u ON u.id = pp.user_id WHERE pp.page_id = ?
                ORDER BY role NULLS FIRST, email
                """, (rs, row) -> {
                    String role = rs.getString("role");
                    return new Member(rs.getObject("id", UUID.class), rs.getString("email"),
                            role == null ? PageAccessLevel.OWNER : PageAccessLevel.fromRole(role));
                }, pageId, pageId);
    }

    public boolean grant(UUID pageId, UUID recipient, String role, UUID grantedBy) {
        return jdbc.update("""
                INSERT INTO page_permissions (page_id, user_id, role, granted_by) VALUES (?, ?, ?, ?)
                ON CONFLICT (page_id, user_id) DO NOTHING
                """, pageId, recipient, role, grantedBy) > 0;
    }

    public boolean change(UUID pageId, UUID recipient, String role) {
        return jdbc.update("""
                UPDATE page_permissions SET role = ?, updated_at = CURRENT_TIMESTAMP
                WHERE page_id = ? AND user_id = ?
                """, role, pageId, recipient) > 0;
    }

    public boolean revoke(UUID pageId, UUID recipient) {
        return jdbc.update("DELETE FROM page_permissions WHERE page_id = ? AND user_id = ?",
                pageId, recipient) > 0;
    }
}
