package com.folio.backend.infrastructure.repository;

import com.folio.backend.application.sharing.PageAccessLevel;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class NotificationRepository {
    public enum Kind { PAGE_SHARED, ACCESS_REQUESTED, ACCESS_GRANTED, ACCESS_DENIED }
    public enum Decision { GRANTED, DENIED }

    public record Item(UUID id, Kind kind, String actorEmail, UUID pageId, String pageTitle,
                       PageAccessLevel permission, String message, Decision decision, Instant createdAt, boolean read) {}
    public record AccessRequest(UUID pageId, UUID requester, PageAccessLevel permission, Decision decision) {}

    private final JdbcTemplate jdbc;

    public NotificationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void add(UUID recipient, UUID actor, UUID page, Kind kind, PageAccessLevel permission, String message) {
        jdbc.update("""
                INSERT INTO notifications (recipient_user_id, actor_user_id, page_id, kind, role, message)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (page_id, actor_user_id)
                    WHERE kind = 'ACCESS_REQUESTED' AND decision IS NULL DO NOTHING
                """, recipient, actor, page, kind.name(), permission.storedRole(), message);
    }

    public List<Item> list(UUID recipient, UUID before, int limit) {
        return jdbc.query("""
                SELECT n.id, n.kind, CASE WHEN n.kind <> 'ACCESS_DENIED' THEN u.email END AS email,
                       n.page_id, n.role, n.message, n.decision, n.created_at, n.read_at,
                       CASE WHEN p.owner_user_id = n.recipient_user_id OR EXISTS (
                           SELECT 1 FROM page_permissions pp
                           WHERE pp.page_id = p.id AND pp.user_id = n.recipient_user_id
                       ) THEN p.title END AS page_title
                FROM notifications n JOIN users u ON u.id = n.actor_user_id JOIN pages p ON p.id = n.page_id
                WHERE n.recipient_user_id = ? AND p.deleted_at IS NULL
                  AND (?::uuid IS NULL OR (n.created_at, n.id) < (
                      SELECT created_at, id FROM notifications WHERE id = ? AND recipient_user_id = ?
                  ))
                ORDER BY n.created_at DESC, n.id DESC
                LIMIT ?
                """, (rs, row) -> new Item(
                rs.getObject("id", UUID.class), Kind.valueOf(rs.getString("kind")), rs.getString("email"),
                rs.getObject("page_id", UUID.class), rs.getString("page_title"),
                PageAccessLevel.fromRole(rs.getString("role")), rs.getString("message"),
                decision(rs.getString("decision")), rs.getObject("created_at", OffsetDateTime.class).toInstant(),
                rs.getTimestamp("read_at") != null),
                recipient, before, before, recipient, limit);
    }

    public long unreadCount(UUID recipient) {
        return jdbc.queryForObject("""
                SELECT count(*) FROM notifications n JOIN pages p ON p.id = n.page_id
                WHERE n.recipient_user_id = ? AND n.read_at IS NULL AND p.deleted_at IS NULL
                """, Long.class, recipient);
    }

    public boolean markRead(UUID id, UUID recipient) {
        return jdbc.update("""
                UPDATE notifications SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
                WHERE id = ? AND recipient_user_id = ?
                """, id, recipient) > 0;
    }

    public Optional<AccessRequest> findRequest(UUID id, UUID recipient) {
        return jdbc.query("""
                SELECT page_id, actor_user_id, role, decision FROM notifications
                WHERE id = ? AND recipient_user_id = ? AND kind = 'ACCESS_REQUESTED'
                """, (rs, row) -> new AccessRequest(rs.getObject("page_id", UUID.class),
                rs.getObject("actor_user_id", UUID.class), PageAccessLevel.fromRole(rs.getString("role")),
                decision(rs.getString("decision"))), id, recipient).stream().findFirst();
    }

    public void decide(UUID id, Decision decision) {
        jdbc.update("""
                UPDATE notifications SET decision = ?, read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
                WHERE id = ?
                """, decision.name(), id);
    }

    public boolean resolveSatisfiedRequest(UUID page, UUID requester, PageAccessLevel permission) {
        String role = permission.storedRole();
        return jdbc.update("""
                UPDATE notifications SET decision = 'GRANTED', read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
                WHERE page_id = ? AND actor_user_id = ? AND kind = 'ACCESS_REQUESTED' AND decision IS NULL
                  AND (role = ? OR ? = 'editor')
                """, page, requester, role, role) > 0;
    }

    private static Decision decision(String value) {
        return value == null ? null : Decision.valueOf(value);
    }
}
