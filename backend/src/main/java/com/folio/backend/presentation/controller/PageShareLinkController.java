package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.PageShareLinkService;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.application.sharing.PageShareLink;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages/{pageId}/share-links")
public class PageShareLinkController {
    private final PageShareLinkService service;
    public PageShareLinkController(PageShareLinkService service) { this.service = service; }

    public record LinkInput(PageAccessLevel permission, Instant expiresAt) {}

    @GetMapping
    public List<PageShareLink> list(@PathVariable UUID pageId, @AuthenticationPrincipal AuthenticatedUser user) {
        return service.list(pageId, user.id());
    }

    @PostMapping
    public ResponseEntity<PageShareLink.Created> create(@PathVariable UUID pageId, @RequestBody LinkInput input,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
                .body(service.create(pageId, user.id(), input.permission(), input.expiresAt()));
    }

    @PatchMapping("/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void change(@PathVariable UUID pageId, @PathVariable UUID linkId, @RequestBody LinkInput input,
            @AuthenticationPrincipal AuthenticatedUser user) {
        service.change(pageId, user.id(), linkId, input.permission(), input.expiresAt());
    }

    @DeleteMapping("/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable UUID pageId, @PathVariable UUID linkId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        service.revoke(pageId, user.id(), linkId);
    }
}
