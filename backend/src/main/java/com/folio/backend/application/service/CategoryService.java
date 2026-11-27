package com.folio.backend.application.service;

import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.presentation.dto.response.CategorySummaryResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {
    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<CategorySummaryResponse> findAll(UUID owner) {
        repository.copyDefaults(owner);
        return repository.findAll(owner).stream()
                .map(CategorySummaryResponse::from)
                .toList();
    }
}
