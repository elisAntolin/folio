package com.folio.backend.infrastructure.repository;

import com.folio.backend.domain.model.Category;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class CategoryRepository {
    private final JdbcTemplate jdbc;

    public CategoryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void lockOwner(UUID owner) {
        jdbc.query("SELECT id FROM users WHERE id = ? FOR NO KEY UPDATE", rs -> { }, owner);
    }

    public void copyDefaults(UUID owner) {
        jdbc.update("""
                INSERT INTO categories (name, color, icon_url, owner_user_id)
                SELECT name, color, icon_url, ? FROM categories c
                WHERE c.owner_user_id IS NULL AND NOT EXISTS (
                    SELECT 1 FROM category_default_exclusions e
                    WHERE e.user_id = ? AND e.category_id = c.id
                )
                ON CONFLICT (owner_user_id, name) DO NOTHING
                """, owner, owner);
    }

    public List<Category> findAll(UUID owner) {
        return jdbc.query("SELECT id, name, icon_url FROM categories WHERE owner_user_id = ? ORDER BY name",
                (rs, row) -> new Category(rs.getObject("id", UUID.class), rs.getString("name"),
                        rs.getString("icon_url")), owner);
    }

    public boolean existsForOwner(UUID categoryId, UUID owner) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM categories WHERE id = ? AND owner_user_id = ?)
                """, Boolean.class, categoryId, owner));
    }

    public boolean createCategory(UUID owner, Category category) {
        return jdbc.update("""
                INSERT INTO categories (id, name, icon_url, owner_user_id) VALUES (?, ?, ?, ?)
                ON CONFLICT (owner_user_id, name) DO NOTHING
                """, category.id(), category.name(), category.iconUrl(), owner) > 0;
    }

    public boolean deleteCategory(UUID owner, String name) {
        var categoryIds = jdbc.query("""
                SELECT id FROM categories WHERE owner_user_id = ? AND name = ? FOR UPDATE
                """, (rs, row) -> rs.getObject(1, UUID.class), owner, name);
        if (categoryIds.isEmpty()) return false;

        UUID categoryId = categoryIds.getFirst();
        // The default catalog is copied on read. Remember a deletion so it stays deleted.
        jdbc.update("""
                INSERT INTO category_default_exclusions (user_id, category_id)
                SELECT ?, id FROM categories WHERE owner_user_id IS NULL AND name = ?
                ON CONFLICT DO NOTHING
                """, owner, name);
        jdbc.update("UPDATE pages SET category_id = NULL WHERE category_id = ?", categoryId);
        return jdbc.update("DELETE FROM categories WHERE id = ? AND owner_user_id = ?", categoryId, owner) > 0;
    }
}
