package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.CategoryQueries;
import com.folio.backend.application.service.CategoryService;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import com.folio.backend.presentation.dto.response.CategorySummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryQueries categories;
    private final CategoryService commands;

    public CategoryController(CategoryQueries categories, CategoryService commands) {
        this.categories = categories;
        this.commands = commands;
    }

    @GetMapping
    public ResponseEntity<List<CategorySummaryResponse>> findAll(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(categories.findAll(user.id()).stream().map(CategorySummaryResponse::from).toList());
    }

    @PostMapping("/register")
    public ResponseEntity<String> createCategory(@RequestBody Map<String, String> category,
            @AuthenticationPrincipal AuthenticatedUser user) {
        commands.createCategory(user.id(), category.get("name"), category.get("icon_url"));
        return ResponseEntity.status(HttpStatus.CREATED).body("Categoria criada com sucesso");
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteCategory(@RequestParam String name,
            @AuthenticationPrincipal AuthenticatedUser user) {
        commands.deleteCategory(user.id(), name);
        return ResponseEntity.noContent().build();
    }
}
