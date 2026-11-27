package com.folio.backend.application.service;

import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.application.sharing.PageAccessException;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.infrastructure.repository.PagePermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PageSharingService {
    private final PageAuthorizationService authorization;
    private final PagePermissionRepository permissions;

    public PageSharingService(PageAuthorizationService authorization, PagePermissionRepository permissions) {
        this.authorization = authorization;
        this.permissions = permissions;
    }

    public List<PagePermissionRepository.Member> members(UUID page, UUID actor) {
        authorization.requireOwner(page, actor);
        return permissions.list(page);
    }

    @Transactional
    public void invite(UUID page, UUID actor, String email, PageAccessLevel permission) {
        lockOwner(page, actor);
        if (email == null || email.isBlank()) throw new PageAccessException.Invalid("Informe um e-mail.");
        UUID recipient = permissions.findRecipient(email.strip())
                .orElseThrow(() -> new PageAccessException.Invalid("Conta destinatária não encontrada."));
        if (actor.equals(recipient)) throw new PageAccessException.Invalid("O proprietário já tem acesso.");
        if (!permissions.grant(page, recipient, role(permission), actor)) {
            throw new PageAccessException.Conflict("Essa conta já tem acesso à página.");
        }
    }

    @Transactional
    public void update(UUID page, UUID actor, UUID recipient, PageAccessLevel permission) {
        lockOwner(page, actor);
        if (!permissions.change(page, recipient, role(permission))) throw new PageNotFound();
    }

    @Transactional
    public void revoke(UUID page, UUID actor, UUID recipient) {
        lockOwner(page, actor);
        if (!permissions.revoke(page, recipient)) throw new PageNotFound();
    }

    private void lockOwner(UUID page, UUID actor) {
        authorization.requireOwner(page, actor);
        authorization.lockPage(page);
    }

    static String role(PageAccessLevel permission) {
        if (permission == null) throw new PageAccessException.Invalid("Informe uma permissão.");
        return permission.storedRole();
    }
}
