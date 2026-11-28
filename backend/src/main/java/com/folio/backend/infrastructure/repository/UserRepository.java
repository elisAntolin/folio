package com.folio.backend.infrastructure.repository;

import com.folio.backend.domain.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class UserRepository {
    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc){
        this.jdbc = jdbc;
    }
    
    public Boolean existsByEmail(String email){
        Boolean exists = jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM users WHERE email = ?)",
            Boolean.class,
            email
        );

        return Boolean.TRUE.equals(exists);
    }

    public User findByEmail(String email){
        return jdbc.queryForObject(
            "SELECT * FROM users WHERE email = ?",
            (rs, rowNum) -> new User(
                rs.getObject("id", UUID.class),
                rs.getString("email"),
                rs.getString("password_hash")
            ),
            email
        );
    }
    public <T> T findByEmail(String email, RowMapper<T> mapper) {
        String sql = """
            SELECT *
            FROM users
            WHERE email = ?
            """;

        return jdbc.queryForObject(sql, mapper, email);
    }

    public UUID findIdByEmail(String email){
        return findByEmail(email,
                (rs, rowNum) -> rs.getObject("id", UUID.class));
    }

    public String findEmailById(UUID id) {
        return jdbc.queryForObject(
            "SELECT email FROM users WHERE id = ?",
            String.class,
            id
        );
    }

    public boolean lockById(UUID id) {
        return !jdbc.queryForList("SELECT id FROM users WHERE id = ? FOR UPDATE", UUID.class, id).isEmpty();
    }
    
    public void save(User user){
        jdbc.update(
            "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
            user.getId(),
            user.getEmail(),
            user.getPasswordHash()
        );
    }

    public boolean updatePassword(String email, String passwordHash) {
        return jdbc.update(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            passwordHash,
            email
        ) == 1;
    }

}
