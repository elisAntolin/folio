package com.folio.backend.infrastructure.repository;


import com.folio.backend.domain.model.Page;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PageRepository {
    private final JdbcTemplate jdbc;

    public PageRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    private static final RowMapper<Page> ROW_MAPPER =
            (rs, _) -> new Page(
                    rs.getObject("id", UUID.class),
                    rs.getObject("owner_user_id", UUID.class),
                    rs.getObject("category_id", UUID.class),
                    rs.getObject("parent_page_id", UUID.class),
                    rs.getString("title"),
                    rs.getString("cover_image_url"),
                    rs.getObject("deleted_at", LocalDateTime.class),
                    rs.getObject("created_at", LocalDateTime.class),
                    rs.getObject("updated_at", LocalDateTime.class),
                    rs.getObject("last_edited_at", LocalDateTime.class)
            );
    public void save(Page page){
        String sql = """
                INSERT INTO pages(
                  id,
                  owner_user_id,
                  category_id,
                  parent_page_id,
                  title,
                  cover_image_url,
                  deleted_at,
                  created_at,
                  updated_at,
                  last_edited_at
                 )
                 VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        jdbc.update(
                sql,
                page.getId(),
                page.getOwnerId(),
                page.getCategoryId(),
                page.getParentId(),
                page.getTitle(),
                page.getCoverImageUrl(),
                page.getDeletedAt(),
                page.getCreatedAt(),
                page.getUpdatedAt(),
                page.getLastEditedAt()
        );
    }

    public List<Page> getRootPages(){
        String sql = """
                    SELECT * FROM PAGES
                    WHERE parent_page_id IS NULL AND deleted_at IS NULL
                    ORDER BY last_edited_at DESC
                """;
        return jdbc.query(sql, ROW_MAPPER);
    }

    public boolean update(Page page, UUID authenticatedUserId){
        String sql = """
                    UPDATE pages
                    SET title = ?,
                        category_id = ?,
                        updated_at = ?
                    WHERE id = ?
                        AND owner_user_id = ?
                        AND deleted_at IS NULL
                """;
        return jdbc.update(sql, page.getTitle(), page.getCategoryId(), page.getUpdatedAt(),
                page.getId(), authenticatedUserId) > 0;
    }

    public boolean existPage(UUID pageId){
        String sql = """
                SELECT EXISTS (
                        SELECT 1 FROM pages WHERE id = ?
                        )
                """;
        return Boolean.TRUE.equals(
                jdbc.queryForObject(sql,Boolean.class,pageId)
        );
    }

    public Optional<Page> findOwnedPage(UUID id, UUID ownerId) {
        String sql = """
                SELECT * FROM pages WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL
                """;
        return jdbc.query(sql, ROW_MAPPER, id, ownerId)
                .stream()
                .findFirst();
    }

    public boolean delete(Page page, UUID authenticatedUserId){
        String sql = """
            UPDATE pages
            SET deleted_at = ?,
                updated_at = ?
            WHERE id = ?
              AND owner_user_id = ?
              AND deleted_at IS NULL
            """;

        return jdbc.update(
                sql,
                page.getDeletedAt(),
                page.getUpdatedAt(),
                page.getId(),
                authenticatedUserId
        ) > 0;
    }

    public void rename(UUID pageId, String title) {
        jdbc.update("UPDATE pages SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", title, pageId);
    }

    public void changeCover(UUID pageId, String cover) {
        jdbc.update("UPDATE pages SET cover_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", cover, pageId);
    }
    public void lockHierarchy(UUID owner) {
        jdbc.query("SELECT pg_advisory_xact_lock(hashtextextended(CAST(? AS TEXT), 0))",
                rs -> { }, owner);
    }

    public boolean isAncestor(UUID page, UUID parent) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                WITH RECURSIVE ancestry AS (
                    SELECT id, parent_page_id FROM pages WHERE id = ?
                    UNION
                    SELECT p.id, p.parent_page_id FROM pages p JOIN ancestry a ON p.id = a.parent_page_id
                )
                SELECT EXISTS (SELECT 1 FROM ancestry WHERE id = ?)
                """, Boolean.class, parent, page));
    }

    public void move(UUID page, UUID parent) {
        jdbc.update("UPDATE pages SET parent_page_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", parent, page);
    }
}
