package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.NotificationService;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.infrastructure.repository.NotificationRepository.Decision;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class NotificationController {
    private final NotificationService notifications;

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }

    public record AccessInput(PageAccessLevel permission, String message) {}
    public record DecisionInput(Decision decision) {}

    @GetMapping("/notifications")
    public ResponseEntity<NotificationService.Inbox> inbox(@AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) UUID before) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(notifications.inbox(user.id(), before));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user) {
        return notifications.markRead(id, user.id()) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/notifications/{id}/decision")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void decide(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody DecisionInput input) {
        notifications.decide(id, user.id(), input.decision());
    }

    @PostMapping("/pages/{pageId}/access-requests")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void requestAccess(@PathVariable UUID pageId, @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody AccessInput input) {
        notifications.requestAccess(pageId, user.id(), input.permission(), input.message());
    }
}
