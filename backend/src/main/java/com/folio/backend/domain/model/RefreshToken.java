package com.folio.backend.domain.model;

import java.time.Instant;
import java.util.UUID;

public record RefreshToken(
        UUID userId,
        UUID sessionId,
        Instant expiresAt
) {
}
