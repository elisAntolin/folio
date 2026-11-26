package com.folio.backend.infrastructure.repository;

import com.folio.backend.domain.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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
                rs.getString("email"),
                rs.getString("password_hash")
            ),
            email
        );
    }
    
    public void save(User user){
        jdbc.update(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            user.getEmail(),
            user.getPasswordHash()
        );
    }

    public void updatePassword(User user){
        jdbc.update(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            user.getPasswordHash(),
            user.getEmail()
        );
    }

}
