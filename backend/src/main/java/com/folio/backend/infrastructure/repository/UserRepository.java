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

    public void createUser(User user){
        jdbc.update(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            user.getEmail(),
            user.getPassword()
        );
    }
}
