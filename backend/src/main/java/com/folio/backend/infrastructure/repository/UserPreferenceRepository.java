package com.folio.backend.infrastructure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class UserPreferenceRepository {
    private final JdbcTemplate jdbc;

    public UserPreferenceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String theme(UUID userId) {
        return jdbc.query("SELECT theme FROM user_preferences WHERE user_id = ?",
                (rs, row) -> rs.getString("theme"), userId).stream().findFirst().orElse("system");
    }

    public void saveTheme(UUID userId, String theme) {
        jdbc.update("""
                INSERT INTO user_preferences (user_id, theme) VALUES (?, ?)
                ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme
                """, userId, theme);
    }
}
