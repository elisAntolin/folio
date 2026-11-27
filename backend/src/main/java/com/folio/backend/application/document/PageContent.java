package com.folio.backend.application.document;

import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;

public record PageContent(JsonNode content, long version, LocalDateTime updatedAt) {
    public record Revision(long version, LocalDateTime updatedAt) {}
}
