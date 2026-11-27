package com.folio.backend.infrastructure.repository;

import com.folio.backend.application.document.PageContent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PageContentRepository {
    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    public PageContentRepository(JdbcTemplate jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public void initialize(UUID pageId) {
        jdbc.update("INSERT INTO page_contents (page_id) VALUES (?)", pageId);
    }

    public Optional<PageContent.Access> find(UUID pageId, UUID userId) {
        return jdbc.query("""
                SELECT pc.content_jsonb, pc.version, pc.updated_at,
                       (p.owner_user_id = ? OR pp.role IS NOT DISTINCT FROM 'editor') AS can_edit
                FROM page_contents pc JOIN pages p ON p.id = pc.page_id
                LEFT JOIN page_permissions pp ON pp.page_id = p.id AND pp.user_id = ?
                WHERE p.id = ? AND p.deleted_at IS NULL
                  AND (p.owner_user_id = ? OR pp.role IN ('reader', 'editor'))
                """,
                (rs, row) -> new PageContent.Access(new PageContent(
                        json.readTree(rs.getString("content_jsonb")),
                        rs.getLong("version"),
                        rs.getObject("updated_at", LocalDateTime.class)), rs.getBoolean("can_edit")),
                userId, userId, pageId, userId).stream().findFirst();
    }

    public Optional<Boolean> lockAccessiblePage(UUID pageId, UUID userId) {
        return jdbc.query("""
                SELECT (p.owner_user_id = ? OR pp.role IS NOT DISTINCT FROM 'editor') AS can_edit
                FROM pages p
                LEFT JOIN page_permissions pp ON pp.page_id = p.id AND pp.user_id = ?
                WHERE p.id = ? AND p.deleted_at IS NULL
                  AND (p.owner_user_id = ? OR pp.role IN ('reader', 'editor'))
                FOR UPDATE OF p
                """, (rs, row) -> rs.getBoolean("can_edit"), userId, userId, pageId, userId)
                .stream().findFirst();
    }

    public Optional<PageContent.Revision> update(
            UUID pageId, UUID userId, JsonNode content, String text, long version) {
        return jdbc.query("""
                UPDATE page_contents pc
                SET content_jsonb = ?::jsonb, content_text = ?, version = pc.version + 1,
                    updated_at = clock_timestamp()
                FROM pages p
                WHERE p.id = pc.page_id AND p.id = ?
                  AND (p.owner_user_id = ? OR EXISTS (
                      SELECT 1 FROM page_permissions pp
                      WHERE pp.page_id = p.id AND pp.user_id = ? AND pp.role = 'editor'
                  ))
                  AND p.deleted_at IS NULL AND pc.version = ?
                RETURNING pc.version, pc.updated_at
                """, (rs, row) -> new PageContent.Revision(rs.getLong("version"),
                rs.getObject("updated_at", LocalDateTime.class)), json.writeValueAsString(content),
                text, pageId, userId, userId, version).stream().findFirst();
    }

    public void markEdited(UUID pageId, LocalDateTime editedAt) {
        jdbc.update("UPDATE pages SET last_edited_at = ? WHERE id = ?", editedAt, pageId);
    }
}
