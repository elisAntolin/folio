package com.folio.backend.domain.model;

import java.util.UUID;

public record Category(UUID id, String name, String iconUrl) {
    public Category(String name, String iconUrl) {
         this(UUID.randomUUID(), name, iconUrl);
    }
}
