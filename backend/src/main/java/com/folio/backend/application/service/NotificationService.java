package com.folio.backend.application.service;

import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.application.sharing.PageAccessException;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.infrastructure.repository.NotificationRepository;
import com.folio.backend.infrastructure.repository.NotificationRepository.Decision;
import com.folio.backend.infrastructure.repository.NotificationRepository.Item;
import com.folio.backend.infrastructure.repository.NotificationRepository.Kind;
import com.folio.backend.infrastructure.repository.PageAccessRepository;
import com.folio.backend.infrastructure.repository.PagePermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private static final int PAGE_SIZE = 30;

    public record Inbox(List<Item> items, long unreadCount, UUID nextCursor) {}

    private final NotificationRepository notifications;
    private final PageAccessRepository pages;
    private final PagePermissionRepository permissions;

    public NotificationService(NotificationRepository notifications, PageAccessRepository pages,
                               PagePermissionRepository permissions) {
        this.notifications = notifications;
        this.pages = pages;
        this.permissions = permissions;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public Inbox inbox(UUID user, UUID before) {
        List<Item> items = notifications.list(user, before, PAGE_SIZE + 1);
        long unreadCount = notifications.unreadCount(user);
        if (items.size() <= PAGE_SIZE) return new Inbox(items, unreadCount, null);
        return new Inbox(items.subList(0, PAGE_SIZE), unreadCount, items.get(PAGE_SIZE - 1).id());
    }

    public boolean markRead(UUID id, UUID user) {
        return notifications.markRead(id, user);
    }

    @Transactional
    public void requestAccess(UUID page, UUID requester, PageAccessLevel requested, String message) {
        PageSharingService.role(requested);
        String note = message == null ? null : message.strip();
        if (note != null && note.length() > 500) {
            throw new PageAccessException.Invalid("A mensagem deve ter até 500 caracteres.");
        }
        UUID owner = pages.lockPageOwner(page).orElse(null);
        // Give the caller the same response for private, missing and already accessible pages.
        if (owner == null || owner.equals(requester)) return;
        PageAccessLevel current = pages.find(page, requester).orElse(null);
        if (current == PageAccessLevel.EDITOR || current == requested) return;

        notifications.add(owner, requester, page, Kind.ACCESS_REQUESTED, requested, note);
    }

    @Transactional
    public void decide(UUID id, UUID owner, Decision decision) {
        if (decision == null) throw new PageAccessException.Invalid("Informe uma decisão.");
        var initial = notifications.findRequest(id, owner).orElseThrow(PageNotFound::new);
        UUID page = initial.pageId();
        if (pages.lockPageOwner(page).filter(owner::equals).isEmpty()) throw new PageNotFound();

        var request = notifications.findRequest(id, owner).orElseThrow(PageNotFound::new);
        if (request.decision() == decision) return;
        if (request.decision() != null) throw new PageAccessException.Conflict("Essa solicitação já foi analisada.");
        if (decision == Decision.GRANTED) {
            boolean granted = permissions.grant(page, request.requester(), request.permission().storedRole(), owner);
            if (!granted && request.permission() == PageAccessLevel.EDITOR) {
                permissions.change(page, request.requester(), request.permission().storedRole());
            }
        }
        notifications.decide(id, decision);
        notifications.add(request.requester(), owner, page,
                decision == Decision.GRANTED ? Kind.ACCESS_GRANTED : Kind.ACCESS_DENIED, request.permission(), null);
    }
}
