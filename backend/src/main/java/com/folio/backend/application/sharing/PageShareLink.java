package com.folio.backend.application.sharing;

import java.time.Instant;
import java.util.UUID;

public record PageShareLink(UUID id, PageAccessLevel permission, Instant expiresAt,
                            Instant revokedAt, Instant createdAt) {
    public record Created(PageShareLink link, String token) {}
    public record Target(UUID pageId, String title, String coverImageUrl, PageShareLink link) {}
}
