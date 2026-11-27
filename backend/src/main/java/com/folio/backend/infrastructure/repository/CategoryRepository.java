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

    public void copyDefaults(UUID owner) {
        jdbc.update("""
                INSERT INTO categories (name, color, owner_user_id)
                SELECT name, color, ? FROM categories WHERE owner_user_id IS NULL
                ON CONFLICT (owner_user_id, name) DO NOTHING
                """, owner);
    }

    public List<Category> findAll(UUID owner) {
        return jdbc.query("SELECT id, name FROM categories WHERE owner_user_id = ? ORDER BY name",
                (rs, row) -> new Category(rs.getObject("id", UUID.class), rs.getString("name")), owner);
    }

    public boolean existsForOwner(UUID categoryId, UUID owner) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM categories WHERE id = ? AND owner_user_id = ?)
                """, Boolean.class, categoryId, owner));
    }
}
