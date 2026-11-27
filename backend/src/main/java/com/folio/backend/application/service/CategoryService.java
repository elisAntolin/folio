package com.folio.backend.application.service;

import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.domain.model.Category;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService implements CategoryQueries {
    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Category> findAll(UUID owner) {
        repository.copyDefaults(owner);
        return repository.findAll(owner);
    }
}
