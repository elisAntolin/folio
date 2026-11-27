package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.PageSharingService;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.infrastructure.repository.PagePermissionRepository;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages/{pageId}/permissions")
public class PageSharingController {
    private final PageSharingService service;
    public PageSharingController(PageSharingService service) { this.service = service; }

    public record Invite(String email, PageAccessLevel permission) {}
    public record Change(PageAccessLevel permission) {}

    @GetMapping
    public List<PagePermissionRepository.Member> members(@PathVariable UUID pageId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return service.members(pageId, user.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void invite(@PathVariable UUID pageId, @RequestBody Invite input,
            @AuthenticationPrincipal AuthenticatedUser user) {
        service.invite(pageId, user.id(), input.email(), input.permission());
    }

    @PatchMapping("/{recipient}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable UUID pageId, @PathVariable UUID recipient, @RequestBody Change input,
            @AuthenticationPrincipal AuthenticatedUser user) {
        service.update(pageId, user.id(), recipient, input.permission());
    }

    @DeleteMapping("/{recipient}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable UUID pageId, @PathVariable UUID recipient,
            @AuthenticationPrincipal AuthenticatedUser user) {
        service.revoke(pageId, user.id(), recipient);
    }
}
