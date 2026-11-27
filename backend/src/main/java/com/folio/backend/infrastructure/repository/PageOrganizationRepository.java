package com.folio.backend.infrastructure.repository;

import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.application.sharing.PageSummary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class PageOrganizationRepository {
    public enum Scope { OWNED, SHARED, FAVORITES }

    private static final RowMapper<PageSummary> SUMMARY = (rs, row) -> new PageSummary(
            rs.getObject("id", UUID.class), rs.getObject("category_id", UUID.class),
            rs.getString("title"), rs.getString("cover_image_url"),
            PageAccessLevel.valueOf(rs.getString("permission")), rs.getBoolean("favorite"));

    private static final String COLUMNS = """
            p.id, CASE WHEN p.owner_user_id = a.user_id THEN p.category_id END AS category_id,
            p.title, p.cover_image_url,
            CASE WHEN p.owner_user_id = a.user_id THEN 'OWNER'
                 WHEN pp.role = 'editor' THEN 'EDITOR' ELSE 'VIEWER' END AS permission,
            f.user_id IS NOT NULL AS favorite
            """;

    private static final String JOINS = """
            LEFT JOIN page_permissions pp ON pp.page_id = p.id AND pp.user_id = a.user_id
            LEFT JOIN page_favorites f ON f.page_id = p.id AND f.user_id = a.user_id
            """;

    private final JdbcTemplate jdbc;
    public PageOrganizationRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<PageSummary> list(UUID user, Scope scope, UUID category, boolean uncategorized, int limit, long offset) {
        String scopeCondition = switch (scope) {
            case OWNED -> "p.owner_user_id = a.user_id";
            case SHARED -> "p.owner_user_id <> a.user_id AND pp.user_id IS NOT NULL";
            case FAVORITES -> "f.user_id IS NOT NULL AND (p.owner_user_id = a.user_id OR pp.user_id IS NOT NULL)";
        };
        String order = scope == Scope.FAVORITES ? "f.created_at DESC" : "p.last_edited_at DESC";
        return jdbc.query("""
                WITH args AS (SELECT CAST(? AS UUID) AS user_id, CAST(? AS UUID) AS category_id)
                SELECT %s
                FROM pages p CROSS JOIN args a
                %s
                WHERE p.deleted_at IS NULL AND (%s)
                  AND (a.category_id IS NULL OR (p.owner_user_id = a.user_id AND p.category_id = a.category_id))
                  AND (NOT ? OR (p.owner_user_id = a.user_id AND p.category_id IS NULL))
                ORDER BY %s, p.id LIMIT ? OFFSET ?
                """.formatted(COLUMNS, JOINS, scopeCondition, order),
                SUMMARY, user, category, uncategorized, limit, offset);
    }

    public List<PageSummary> search(String query, UUID user, UUID category, boolean uncategorized, boolean favorites) {
        return jdbc.query("""
                WITH args AS (
                    SELECT websearch_to_tsquery('portuguese', ?) AS query,
                           CAST(? AS UUID) AS user_id, CAST(? AS UUID) AS category_id
                ),
                matches AS (
                    SELECT p.id AS page_id, TRUE AS title_match, ts_rank(p.search_vector, a.query) AS relevance
                    FROM pages p CROSS JOIN args a
                    WHERE p.deleted_at IS NULL AND p.search_vector @@ a.query
                    UNION ALL
                    SELECT pc.page_id, FALSE, ts_rank(pc.search_vector, a.query)
                    FROM page_contents pc CROSS JOIN args a WHERE pc.search_vector @@ a.query
                ),
                ranked AS (
                    SELECT page_id, BOOL_OR(title_match) AS title_match, SUM(relevance) AS relevance
                    FROM matches GROUP BY page_id
                )
                SELECT %s FROM ranked r JOIN pages p ON p.id = r.page_id CROSS JOIN args a
                %s
                WHERE p.deleted_at IS NULL AND (p.owner_user_id = a.user_id OR pp.user_id IS NOT NULL)
                  AND (a.category_id IS NULL OR (p.owner_user_id = a.user_id AND p.category_id = a.category_id))
                  AND (NOT ? OR (p.owner_user_id = a.user_id AND p.category_id IS NULL))
                  AND (NOT ? OR f.user_id IS NOT NULL)
                ORDER BY r.title_match DESC, r.relevance DESC, p.last_edited_at DESC, p.id
                LIMIT 50
                """.formatted(COLUMNS, JOINS), SUMMARY, query, user, category, uncategorized, favorites);
    }

    public void addFavorite(UUID page, UUID user) {
        jdbc.update("""
                INSERT INTO page_favorites (page_id, user_id) VALUES (?, ?)
                ON CONFLICT (user_id, page_id) DO NOTHING
                """, page, user);
    }

    public void removeFavorite(UUID page, UUID user) {
        jdbc.update("DELETE FROM page_favorites WHERE page_id = ? AND user_id = ?", page, user);
    }
}
