package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.PageOrganizationService;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pages/{id}/favorite")
public class PageFavoriteController {
    private final PageOrganizationService service;

    public PageFavoriteController(PageOrganizationService service) { this.service = service; }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addFavorite(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user) {
        service.favorite(id, user.id());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user) {
        service.unfavorite(id, user.id());
    }
}
