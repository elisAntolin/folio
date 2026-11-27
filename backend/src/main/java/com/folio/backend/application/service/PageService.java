package com.folio.backend.application.service;

import com.folio.backend.domain.model.Page;
import com.folio.backend.domain.validation.Validation;
import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.infrastructure.repository.PageRepository;
import com.folio.backend.infrastructure.repository.UserRepository;
import com.folio.backend.presentation.dto.response.PageSummaryResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PageService {
    private final PageRepository repository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    public PageService(PageRepository repo, CategoryRepository categoryRepo, UserRepository userRepo){
        repository = repo;
        categoryRepository = categoryRepo;
        userRepository = userRepo;
    }

    public UUID createPage(String title, UUID categoryId, UUID ownerId){
        if(categoryId != null && !categoryRepository.existCategory(categoryId))
            throw new IllegalStateException("a categoria deve ser valida");
        Page page = new Page(ownerId, categoryId, null, title, null);
        repository.save(page);
        return page.getId();

    }

    public void editPage(UUID pageId, String title, UUID categoryId, UUID authenticatedUserId){
        if(categoryId != null && !categoryRepository.existCategory(categoryId))
            throw new IllegalStateException("a categoria deve ser valida");
        Optional<Page> optionalPage = repository.findById(pageId);
        if(optionalPage.isEmpty())
            throw new IllegalArgumentException("Página não encontrada");
        Page page = optionalPage.get();
        page.rename(title);
        page.changeCategory(categoryId);
        repository.update(page, authenticatedUserId);

    }

    public void deletePage(UUID pageId, UUID authenticatedUserId){
        Optional<Page> optionalPage = repository.findById(pageId);
        if(optionalPage.isEmpty())
            throw new IllegalArgumentException("Página não encontrada");
        Page page = optionalPage.get();
        page.delete(authenticatedUserId);
        repository.delete(page, authenticatedUserId);
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
