package com.folio.backend.application.service;

import com.folio.backend.infrastructure.repository.CategoryRepository;
import com.folio.backend.domain.model.Category;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository){
        this.repository = repository;
    }

    public void createCategory(String name, String iconUrl){
        Category category = new Category(name, iconUrl);
        repository.createCategory(category);
    }

    public void deleteCategory(String name){
        repository.deleteCategory(name);
    }
}
