package com.folio.backend.infrastructure.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import java.util.UUID;

final class OwnerCacheGenerations {
    private final Cache<UUID, UUID> generations = Caffeine.newBuilder().maximumSize(4_096).build();

    UUID current(UUID owner) {
        return generations.get(owner, ignored -> UUID.randomUUID());
    }

    void invalidate(UUID owner) {
        // An in-flight read can only publish under its old generation.
        generations.invalidate(owner);
    }
}
