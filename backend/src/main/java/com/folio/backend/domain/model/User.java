package com.folio.backend.domain.model;

import java.util.UUID;

public class User {
    private final UUID id;
    private String email;
    private String password;

    public User(String email, String password){
        this.id = UUID.randomUUID();
        this.email = email;
        this.password = password;
    }

    public UUID getId() {return id;}
    public String getEmail() {return email;}
    public String getPassword() {return password;}
}
