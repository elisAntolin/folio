package com.folio.backend.application.service;

import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.application.sharing.PageAccessException;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.infrastructure.repository.PageAccessRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PageAuthorizationService {
    private final PageAccessRepository repository;

    public PageAuthorizationService(PageAccessRepository repository) { this.repository = repository; }

    public PageAccessLevel requireAccess(UUID pageId, UUID userId) {
        return repository.find(pageId, userId).orElseThrow(PageNotFound::new);
    }

    public void lockPage(UUID pageId) {
        if (!repository.lockPage(pageId)) throw new PageNotFound();
    }

    public PageAccessLevel requireOwner(UUID pageId, UUID userId) {
        PageAccessLevel access = requireAccess(pageId, userId);
        if (access != PageAccessLevel.OWNER) throw new PageAccessException.Forbidden();
        return access;
    }

    public void requireEditor(PageAccessLevel access) {
        if (!access.canEdit()) throw new PageAccessException.Forbidden();
    }
}
