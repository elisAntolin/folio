package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.PageQueries;
import com.folio.backend.application.sharing.PageSummary;
import com.folio.backend.application.service.PageQueries.Scope;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages")
public class PageOrganizationController {
    private final PageQueries queries;
    public PageOrganizationController(PageQueries queries) { this.queries = queries; }

    @GetMapping({"", "/recent"})
    public List<PageSummary> owned(@RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "false") boolean uncategorized,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "40") int size,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return queries.list(user.id(), Scope.OWNED, categoryId, uncategorized, page, size);
    }

    @GetMapping("/{id}")
    public PageSummary find(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user) {
        return queries.find(id, user.id());
    }

    @GetMapping("/shared-with-me")
    public List<PageSummary> shared(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "40") int size, @AuthenticationPrincipal AuthenticatedUser user) {
        return queries.list(user.id(), Scope.SHARED, null, false, page, size);
    }

    @GetMapping("/favorites")
    public List<PageSummary> favorites(@RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "false") boolean uncategorized,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "40") int size,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return queries.list(user.id(), Scope.FAVORITES, categoryId, uncategorized, page, size);
    }

    @GetMapping("/search")
    public List<PageSummary> search(@RequestParam("q") String query, @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "false") boolean uncategorized,
            @RequestParam(defaultValue = "false") boolean favoritesOnly,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return queries.search(query, user.id(), categoryId, uncategorized, favoritesOnly);
    }
}
