package com.folio.backend.application.service;

import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.application.sharing.PageAccessException;
import com.folio.backend.application.sharing.PageSummary;
import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.infrastructure.repository.PageOrganizationRepository;
import com.folio.backend.infrastructure.repository.PageOrganizationRepository.Scope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PageOrganizationService {
    private final PageOrganizationRepository repository;
    private final CategoryRepository categories;
    private final PageAuthorizationService authorization;

    public PageOrganizationService(PageOrganizationRepository repository, CategoryRepository categories,
                                   PageAuthorizationService authorization) {
        this.repository = repository;
        this.categories = categories;
        this.authorization = authorization;
    }

    public List<PageSummary> list(UUID user, Scope scope, UUID category, boolean uncategorized, int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new PageAccessException.Invalid("Paginação inválida.");
        validateCategory(user, category, uncategorized);
        return repository.list(user, scope, category, uncategorized, size, (long) page * size);
    }

    public List<PageSummary> search(String query, UUID user, UUID category, boolean uncategorized, boolean favorites) {
        validateCategory(user, category, uncategorized);
        if (query.isBlank()) return List.of();
        return repository.search(query.strip(), user, category, uncategorized, favorites);
    }

    void validateCategory(UUID user, UUID category, boolean uncategorized) {
        if (category == null) return;
        if (uncategorized) throw new PageAccessException.Invalid("Selecione apenas um filtro de categoria.");
        if (!categories.existsForOwner(category, user)) throw new PageNotFound();
    }

    @Transactional
    public void favorite(UUID page, UUID user) {
        authorization.requireAccess(page, user);
        authorization.lockPage(page);
        authorization.requireAccess(page, user);
        repository.addFavorite(page, user);
    }

    public void unfavorite(UUID page, UUID user) {
        repository.removeFavorite(page, user);
    }
}
