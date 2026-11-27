package com.folio.backend.infrastructure.security;


import java.util.UUID;

import org.springframework.security.core.AuthenticatedPrincipal;

public record AuthenticatedUser(
        UUID id,
        String email
) implements AuthenticatedPrincipal {
    @Override
    public String getName() {
        return email;
    }
}