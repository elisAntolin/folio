package com.folio.backend.presentation.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.folio.backend.application.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> createCategory(@RequestBody Map<String, String> category) {

        if (category.get("name") == null || category.get("name").isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }

        categoryService.createCategory(
            category.get("name"),
            category.get("icon_url")
        );

        return ResponseEntity.status(HttpStatus.CREATED).body("Categoria criada com sucesso");
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteCategory(@RequestParam String name) {

        categoryService.deleteCategory(name);

        return ResponseEntity.noContent().build();
    }
}
