package com.folio.backend.application.service;

import com.folio.backend.application.event.CategoriesChanged;
import com.folio.backend.application.event.OwnedPagesChanged;
import com.folio.backend.application.sharing.PageAccessException;
import com.folio.backend.domain.model.Category;
import com.folio.backend.infrastructure.repository.CategoryRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService implements CategoryQueries {
    private final CategoryRepository repository;
    private final ApplicationEventPublisher events;

    public CategoryService(CategoryRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    @Transactional
    public List<Category> findAll(UUID owner) {
        repository.lockOwner(owner);
        repository.copyDefaults(owner);
        return repository.findAll(owner);
    }

    @Transactional
    public void createCategory(UUID owner, String name, String iconUrl) {
        String normalized = validatedName(name);
        repository.lockOwner(owner);
        if (!repository.createCategory(owner, new Category(normalized, iconUrl))) {
            throw new PageAccessException.Conflict("Já existe uma categoria com esse nome.");
        }
        events.publishEvent(new CategoriesChanged(owner));
    }

    @Transactional
    public void deleteCategory(UUID owner, String name) {
        String normalized = validatedName(name);
        repository.lockOwner(owner);
        if (!repository.deleteCategory(owner, normalized)) return;
        events.publishEvent(new CategoriesChanged(owner));
        events.publishEvent(new OwnedPagesChanged(owner));
    }

    private String validatedName(String name) {
        if (name == null || name.isBlank() || name.strip().length() > 100) {
            throw new PageAccessException.Invalid("Informe um nome de até 100 caracteres.");
        }
        return name.strip();
    }
}
