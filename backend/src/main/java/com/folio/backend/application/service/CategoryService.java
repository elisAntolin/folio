package com.folio.backend.application.service;

import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.presentation.dto.response.CategorySummaryResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<CategorySummaryResponse> findAll() {
        return repository.findAll().stream()
                .map(CategorySummaryResponse::from)
                .toList();
    }
}
