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

    public List<Category> findAll() {
        return jdbc.query("SELECT id, name FROM categories ORDER BY name",
                (rs, row) -> new Category(
                        rs.getObject("id", UUID.class), rs.getString("name")));
    }

    public boolean existCategory(UUID categoryId){
        String sql = """
                SELECT EXISTS (
                        SELECT 1 FROM categories WHERE id = ?
                        )
                """;
        return Boolean.TRUE.equals(
                jdbc.queryForObject(sql,Boolean.class,categoryId)
        );
    }
}
