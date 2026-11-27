package com.folio.backend.infrastructure.repository;

import com.folio.backend.domain.model.Category;
import org.springframework.jdbc.core.JdbcTemplate;

public class CategoryRepository {
    private final JdbcTemplate jdbc;

    public CategoryRepository(JdbcTemplate jdbc){
        this.jdbc = jdbc;
    }

    public void createCategory(Category category){
        jdbc.update(
            "INSERT INTO categories (name, icon_url) VALUES (?, ?)",
            category.name(),
            category.iconUrl()
        );
    }

    public void deleteCategory(String name){
        jdbc.update(
            "DELETE FROM categories WHERE name = ?",
            name
        );
    }
}
