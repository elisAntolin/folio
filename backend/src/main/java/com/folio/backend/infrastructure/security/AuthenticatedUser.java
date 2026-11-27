package com.folio.backend.infrastructure.security;


import java.util.UUID;

public record AuthenticatedUser(
        UUID id,
        String email
) {}