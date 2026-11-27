package com.folio.backend.infrastructure.cache;

import com.folio.backend.application.service.CategoryQueries;
import com.folio.backend.domain.model.Category;
import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

public final class CachedCategoryQueries implements CategoryQueries {
    record Key(UUID owner, UUID generation) {}

    private final CategoryQueries delegate;
    private final Cache<Key, List<Category>> cache;
    private final OwnerCacheGenerations generations = new OwnerCacheGenerations();

    CachedCategoryQueries(CategoryQueries delegate, Cache<Key, List<Category>> cache) {
        this.delegate = delegate;
        this.cache = cache;
    }

    @Override
    public List<Category> findAll(UUID owner) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) return delegate.findAll(owner);

        var key = new Key(owner, generations.current(owner));
        return cache.get(key, ignored -> List.copyOf(delegate.findAll(owner)));
    }

    void invalidateOwner(UUID owner) {
        generations.invalidate(owner);
    }
}
