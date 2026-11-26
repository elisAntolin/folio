package com.folio.backend.domain.model;

import java.util.UUID;

public class User {
    private final UUID id;
    private String email;
    private String passwordHash;

    public User(String email, String passwordHash){
        this.id = UUID.randomUUID();
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public UUID getId() {return id;}
    public String getEmail() {return email;}
    public String getPasswordHash() {return passwordHash;}
}
