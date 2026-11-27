package com.folio.backend.infrastructure.repository;


import com.folio.backend.domain.model.Page;
import com.folio.backend.presentation.dto.response.PageSummaryResponse;
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

    public void update(Page page, UUID authenticatedUserId){
        String sql = """
                    UPDATE pages
                    SET title = ?,
                        category_id = ?,
                        updated_at = ?
                    WHERE id = ?
                        AND owner_user_id = ?
                        AND deleted_at IS NULL
                """;
        int affectedRow = jdbc.update(sql,page.getTitle(), page.getCategoryId(), page.getUpdatedAt(), page.getId(), authenticatedUserId);
        if(affectedRow == 0){
            throw new IllegalStateException("Pagina nao encontrada");
        }
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

    public Optional<Page> findById(UUID id){
        String sql = """
                SELECT * FROM pages WHERE id = ?
                """;
        return jdbc.query(sql, ROW_MAPPER,id)
                .stream()
                .findFirst();
    }

    public void delete(Page page, UUID authenticatedUserId){
        String sql = """
            UPDATE pages
            SET deleted_at = ?,
                updated_at = ?
            WHERE id = ?
              AND owner_user_id = ?
              AND deleted_at IS NULL
            """;

        int affectedRows = jdbc.update(
                sql,
                page.getDeletedAt(),
                page.getUpdatedAt(),
                page.getId(),
                authenticatedUserId
        );

        if (affectedRows == 0) {
            throw new IllegalStateException(
                    "Não foi possível excluir a página"
            );
        }
    }

    public List<Page> findRecentPagesByOwnerId(UUID ownerId){
        String sql = """
                SELECT * FROM pages
                         WHERE owner_user_id = ?
                            AND deleted_at IS NULL
                            ORDER BY last_edited_at DESC
                """;
        return jdbc.query(sql,ROW_MAPPER, ownerId);
    }

    public List<PageSummaryResponse> searchPages(
            String query,
            UUID ownerId
    ) {
        String sql = """
        WITH search_query AS (
            SELECT
                websearch_to_tsquery('portuguese', ?) AS query,
                CAST(? AS UUID) AS owner_id
        ),
        matches AS (
            SELECT
                p.id AS page_id,
                TRUE AS title_match,
                ts_rank(p.search_vector, q.query) AS relevance
            FROM pages p
            CROSS JOIN search_query q
            WHERE p.owner_user_id = q.owner_id
              AND p.deleted_at IS NULL
              AND p.search_vector @@ q.query

            UNION ALL

            SELECT
                pc.page_id,
                FALSE AS title_match,
                ts_rank(pc.search_vector, q.query) AS relevance
            FROM page_contents pc
            INNER JOIN pages p
                ON p.id = pc.page_id
            CROSS JOIN search_query q
            WHERE p.owner_user_id = q.owner_id
              AND p.deleted_at IS NULL
              AND pc.search_vector @@ q.query
        ),
        ranked_pages AS (
            SELECT
                page_id,
                BOOL_OR(title_match) AS title_match,
                SUM(relevance) AS relevance
            FROM matches
            GROUP BY page_id
        )
        SELECT
            p.id,
            p.category_id,
            p.title,
            p.cover_image_url
        FROM ranked_pages rp
        INNER JOIN pages p
            ON p.id = rp.page_id
        ORDER BY
            rp.title_match DESC,
            rp.relevance DESC,
            p.last_edited_at DESC,
            p.id
        LIMIT 50
        """;

        return jdbc.query(
                sql,
                (rs, rowNum) -> new PageSummaryResponse(
                        rs.getObject("id", UUID.class),
                        rs.getObject("category_id", UUID.class),
                        rs.getString("title"),
                        rs.getString("cover_image_url")
                ),
                query,
                ownerId
        );
    }
}
