package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.CategoryService;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.folio.backend.presentation.dto.response.CategorySummaryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategorySummaryResponse>> findAll(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(categoryService.findAll(user.id()));
    }
}
