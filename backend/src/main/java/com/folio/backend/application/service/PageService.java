package com.folio.backend.application.service;

import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.domain.model.Page;
import com.folio.backend.infrastructure.repository.PageContentRepository;
import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.infrastructure.repository.PageRepository;
import com.folio.backend.infrastructure.repository.UserRepository;
import com.folio.backend.presentation.dto.response.PageSummaryResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PageService {
    private final PageRepository repository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PageContentRepository contentRepository;

    public PageService(PageRepository repo, CategoryRepository categoryRepo, UserRepository userRepo,
                       PageContentRepository contentRepository) {
        repository = repo;
        categoryRepository = categoryRepo;
        userRepository = userRepo;
        this.contentRepository = contentRepository;
    }

    @Transactional
    public UUID createPage(String title, UUID categoryId, UUID ownerId){
        if(categoryId != null && !categoryRepository.existCategory(categoryId))
            throw new IllegalStateException("a categoria deve ser valida");
        Page page = new Page(ownerId, categoryId, null, title, null);
        repository.save(page);
        contentRepository.initialize(page.getId());
        return page.getId();

    }

    public void editPage(UUID pageId, String title, UUID categoryId, UUID authenticatedUserId){
        if(categoryId != null && !categoryRepository.existCategory(categoryId))
            throw new IllegalStateException("a categoria deve ser valida");
        Page page = findOwnedPage(pageId, authenticatedUserId);
        page.rename(title);
        page.changeCategory(categoryId);
        if (!repository.update(page, authenticatedUserId)) throw new PageNotFound();

    }

    public void deletePage(UUID pageId, UUID authenticatedUserId){
        Page page = findOwnedPage(pageId, authenticatedUserId);
        page.delete(authenticatedUserId);
        if (!repository.delete(page, authenticatedUserId)) throw new PageNotFound();
    }

    private Page findOwnedPage(UUID pageId, UUID ownerId) {
        return repository.findOwnedPage(pageId, ownerId).orElseThrow(PageNotFound::new);
    }

    public List<PageSummaryResponse> findRecents(String email){
        UUID authenticatedUserId = userRepository.findIdByEmail(email);
        return repository.findRecentPagesByOwnerId(authenticatedUserId)
                .stream()
                .map(PageSummaryResponse::from)
                .toList();
    }

    public List<PageSummaryResponse> searchPages(String query, UUID userId){
        if (query == null || query.isBlank()) {
            return List.of();
        }

        return repository.searchPages(
                query.strip(),
                userId
        );
    }
}
