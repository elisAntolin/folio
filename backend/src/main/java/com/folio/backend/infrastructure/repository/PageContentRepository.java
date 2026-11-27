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

    public Optional<PageContent> find(UUID pageId) {
        return jdbc.query("""
                SELECT content_jsonb, version, updated_at FROM page_contents WHERE page_id = ?
                """, (rs, row) -> new PageContent(json.readTree(rs.getString("content_jsonb")),
                rs.getLong("version"), rs.getObject("updated_at", LocalDateTime.class)), pageId)
                .stream().findFirst();
    }

    public Optional<PageContent.Revision> update(
            UUID pageId, JsonNode content, String text, long version) {
        return jdbc.query("""
                UPDATE page_contents pc
                SET content_jsonb = ?::jsonb, content_text = ?, version = pc.version + 1,
                    updated_at = clock_timestamp()
                WHERE pc.page_id = ? AND pc.version = ?
                RETURNING pc.version, pc.updated_at
                """, (rs, row) -> new PageContent.Revision(rs.getLong("version"),
                rs.getObject("updated_at", LocalDateTime.class)), json.writeValueAsString(content),
                text, pageId, version).stream().findFirst();
    }

    public void markEdited(UUID pageId, LocalDateTime editedAt) {
        jdbc.update("UPDATE pages SET last_edited_at = ? WHERE id = ?", editedAt, pageId);
    }
}
