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

    public Optional<PageContent> find(UUID pageId, UUID ownerId) {
        return jdbc.query("""
                SELECT pc.content_jsonb, pc.version, pc.updated_at
                FROM page_contents pc JOIN pages p ON p.id = pc.page_id
                WHERE p.id = ? AND p.owner_user_id = ? AND p.deleted_at IS NULL
                """,
                (rs, row) -> new PageContent(
                        json.readTree(rs.getString("content_jsonb")),
                        rs.getLong("version"),
                        rs.getObject("updated_at", LocalDateTime.class)),
                        pageId, ownerId)
                .stream()
                .findFirst();
    }

    public boolean lockOwnedPage(UUID pageId, UUID ownerId) {
        return !jdbc.query("""
                SELECT id FROM pages
                WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL
                FOR UPDATE
                """, (rs, row) -> rs.getObject(1, UUID.class), pageId, ownerId).isEmpty();
    }

    public Optional<PageContent.Revision> update(
            UUID pageId, UUID ownerId, JsonNode content, String text, long version) {
        return jdbc.query("""
                UPDATE page_contents pc
                SET content_jsonb = ?::jsonb, content_text = ?, version = pc.version + 1,
                    updated_at = clock_timestamp()
                FROM pages p
                WHERE p.id = pc.page_id AND p.id = ? AND p.owner_user_id = ?
                  AND p.deleted_at IS NULL AND pc.version = ?
                RETURNING pc.version, pc.updated_at
                """, (rs, row) -> new PageContent.Revision(rs.getLong("version"),
                rs.getObject("updated_at", LocalDateTime.class)), json.writeValueAsString(content),
                text, pageId, ownerId, version).stream().findFirst();
    }

    public void markEdited(UUID pageId, LocalDateTime editedAt) {
        jdbc.update("UPDATE pages SET last_edited_at = ? WHERE id = ?", editedAt, pageId);
    }
}
