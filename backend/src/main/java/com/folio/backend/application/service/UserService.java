package com.folio.backend.application.service;

import java.util.Locale;
import java.util.UUID;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.folio.backend.domain.model.User;
import com.folio.backend.infrastructure.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder; 
    }

    public User authenticateUser(String email, String password) {
        User user;
        try {
            user = repository.findByEmail(normalizeEmail(email));
        } catch (EmptyResultDataAccessException exception) {
            throw invalidCredentials();
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw invalidCredentials();
        }

        return user;
    }

    public User createUser(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        if (repository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = new User(UUID.randomUUID(), normalizedEmail, passwordHash);
        repository.save(user);
        return user;
    }

    public void updateUserPassword(String email, String password) {
        String passwordHash = passwordEncoder.encode(password);

        if (!repository.updatePassword(normalizeEmail(email), passwordHash)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
    }
}
