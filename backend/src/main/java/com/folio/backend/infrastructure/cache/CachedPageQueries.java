package com.folio.backend.infrastructure.cache;

import com.folio.backend.application.event.OwnedPagesChanged;
import com.folio.backend.application.service.PageQueries;
import com.folio.backend.application.sharing.PageSummary;
import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

public final class CachedPageQueries implements PageQueries {
    record Key(UUID owner, UUID generation, UUID category, boolean uncategorized, int page, int size) {}

    private final PageQueries delegate;
    private final Cache<Key, List<PageSummary>> cache;
    private final OwnerCacheGenerations generations = new OwnerCacheGenerations();

    CachedPageQueries(PageQueries delegate, Cache<Key, List<PageSummary>> cache) {
        this.delegate = delegate;
        this.cache = cache;
    }

    @Override
    public List<PageSummary> list(UUID user, Scope scope, UUID category, boolean uncategorized, int page, int size) {
        if (scope != Scope.OWNED || TransactionSynchronizationManager.isActualTransactionActive()) {
            return delegate.list(user, scope, category, uncategorized, page, size);
        }

        var key = new Key(user, generations.current(user), category, uncategorized, page, size);
        return cache.get(key, ignored -> List.copyOf(delegate.list(user, scope, category, uncategorized, page, size)));
    }

    @Override
    public PageSummary find(UUID page, UUID user) {
        return delegate.find(page, user);
    }

    @Override
    public List<PageSummary> search(String query, UUID user, UUID category, boolean uncategorized, boolean favorites) {
        return delegate.search(query, user, category, uncategorized, favorites);
    }

    @TransactionalEventListener
    public void onOwnedPagesChanged(OwnedPagesChanged event) {
        invalidateOwner(event.ownerId());
    }

    void invalidateOwner(UUID owner) {
        generations.invalidate(owner);
    }
}
