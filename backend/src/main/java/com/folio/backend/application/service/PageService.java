package com.folio.backend.application.service;

import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.application.event.OwnedPagesChanged;
import com.folio.backend.application.sharing.PageAccessException;
import com.folio.backend.domain.model.Page;
import com.folio.backend.infrastructure.repository.PageContentRepository;
import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.infrastructure.repository.PageRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PageService {
    private final PageRepository repository;
    private final CategoryRepository categoryRepository;
    private final PageContentRepository contentRepository;
    private final PageAuthorizationService authorization;
    private final ApplicationEventPublisher events;

    public PageService(PageRepository repo, CategoryRepository categoryRepo,
                       PageContentRepository contentRepository, PageAuthorizationService authorization, ApplicationEventPublisher events) {
        repository = repo;
        categoryRepository = categoryRepo;
        this.contentRepository = contentRepository;
        this.authorization = authorization;
        this.events = events;
    }

    @Transactional
    public UUID createPage(String title, UUID categoryId, UUID parentId, UUID ownerId){
        if(categoryId != null && !categoryRepository.existsForOwner(categoryId, ownerId))
            throw new PageNotFound();
        if (parentId != null) {
            authorization.requireOwner(parentId, ownerId);
            authorization.lockPage(parentId);
        }
        Page page = new Page(ownerId, categoryId, parentId, title, null);
        repository.save(page);
        contentRepository.initialize(page.getId());
        events.publishEvent(new OwnedPagesChanged(ownerId));
        return page.getId();

    }

    @Transactional
    public void editPage(UUID pageId, String title, UUID categoryId, UUID authenticatedUserId){
        authorization.requireOwner(pageId, authenticatedUserId);
        if(categoryId != null && !categoryRepository.existsForOwner(categoryId, authenticatedUserId))
            throw new PageNotFound();
        Page page = findOwnedPage(pageId, authenticatedUserId);
        page.rename(title);
        page.changeCategory(categoryId);
        if (!repository.update(page, authenticatedUserId)) throw new PageNotFound();
        events.publishEvent(new OwnedPagesChanged(authenticatedUserId));

    }

    @Transactional
    public void deletePage(UUID pageId, UUID authenticatedUserId){
        authorization.requireOwner(pageId, authenticatedUserId);
        Page page = findOwnedPage(pageId, authenticatedUserId);
        page.delete(authenticatedUserId);
        if (!repository.delete(page, authenticatedUserId)) throw new PageNotFound();
        events.publishEvent(new OwnedPagesChanged(authenticatedUserId));
    }

    @Transactional
    public void rename(UUID pageId, UUID actor, String title) {
        if (title == null || title.isBlank() || title.length() > 255) {
            throw new PageAccessException.Invalid("Informe um título válido.");
        }
        lockEditor(pageId, actor);
        events.publishEvent(new OwnedPagesChanged(repository.rename(pageId, title.strip())));
    }

    @Transactional
    public void changeCover(UUID pageId, UUID actor, String cover) {
        if (cover != null && (cover.length() > 2_800_000 ||
                !(cover.matches("#[0-9A-Fa-f]{6}") || cover.equals("/folio-cover.jpg")
                  || cover.matches("data:image/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+")))) {
            throw new PageAccessException.Invalid("Use uma imagem PNG, JPEG, GIF ou WebP de até 2 MB.");
        }
        lockEditor(pageId, actor);
        events.publishEvent(new OwnedPagesChanged(repository.changeCover(pageId, cover)));
    }

    @Transactional
    public void move(UUID pageId, UUID actor, UUID parentId) {
        authorization.requireOwner(pageId, actor);
        repository.lockHierarchy(actor);
        authorization.lockPage(pageId);
        if (parentId != null) {
            authorization.requireOwner(parentId, actor);
            authorization.lockPage(parentId);
            if (repository.isAncestor(pageId, parentId)) {
                throw new PageAccessException.Invalid("A página não pode ser movida para si mesma ou para uma descendente.");
            }
        }
        repository.move(pageId, parentId);
        events.publishEvent(new OwnedPagesChanged(actor));
    }

    private void lockEditor(UUID pageId, UUID actor) {
        authorization.requireEditor(authorization.requireAccess(pageId, actor));
        authorization.lockPage(pageId);
        authorization.requireEditor(authorization.requireAccess(pageId, actor));
    }

    private Page findOwnedPage(UUID pageId, UUID ownerId) {
        return repository.findOwnedPage(pageId, ownerId).orElseThrow(PageNotFound::new);
    }

}
