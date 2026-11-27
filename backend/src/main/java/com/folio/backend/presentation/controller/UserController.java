package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.UserService;
import com.folio.backend.application.service.JwtService;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.folio.backend.domain.model.User;

import java.util.Map;


@RestController 
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> createUser(@RequestBody Map<String, String> user){
        if (user.get("email") == null || user.get("email").isBlank())
            throw new IllegalArgumentException("E-mail é obrigatório");
        
        if (user.get("password") == null || user.get("password").isBlank()) 
            throw new IllegalArgumentException("Senha é obrigatória");

        userService.createUser(user.get("email"), user.get("password"));
        return ResponseEntity.ok("Usuário criado com sucesso");

    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody Map<String, String> user){
        if (user.get("email") == null || user.get("email").isBlank())
            throw new IllegalArgumentException("E-mail é obrigatório");
        
        if (user.get("password") == null || user.get("password").isBlank()) 
            throw new IllegalArgumentException("Senha é obrigatória");

        User authenticatedUser = userService.authenticateUser(user.get("email"), user.get("password"));

        String token = jwtService.generateToken(authenticatedUser.getEmail());

        return ResponseEntity.ok(Map.of("token", token));
    }

    @PatchMapping("/updatePassword")
    public ResponseEntity<String> updatePassword(
            @RequestBody Map<String, String> user,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser){
              
        if (user.get("password") == null || user.get("password").isBlank()) 
            throw new IllegalArgumentException("Senha é obrigatória");

        userService.updateUserPassword(authenticatedUser.email(), user.get("password"));
        return ResponseEntity.ok("Senha atualizada com sucesso");
    }
    
}
