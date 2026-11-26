package com.folio.backend.application.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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

    public User authenticateUser(String email, String password){
        User user = repository.findByEmail(email);
        if(!passwordEncoder.matches(password, user.getPasswordHash()))
            throw new RuntimeException("Credenciais inválidas");
            
        return user;
        
    }

    public void createUser(String email, String password){
        if(repository.existsByEmail(email))
            throw new RuntimeException("E-mail de usuário já cadastrado");
    
        String passwordHash = passwordEncoder.encode(password);
        User user = new User(email, passwordHash);
        repository.save(user);
    }

    public void updateUserPassword(String email, String password){
        String passwordHash = passwordEncoder.encode(password);
        User user = new User(email, passwordHash);
        repository.updatePassword(user);

    }

}
