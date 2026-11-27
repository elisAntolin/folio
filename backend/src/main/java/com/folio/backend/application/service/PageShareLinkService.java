package com.folio.backend.application.service;

import com.folio.backend.application.document.PageContent;
import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.application.sharing.PageAccessException;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.application.sharing.PageShareLink;
import com.folio.backend.infrastructure.repository.PageShareLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class PageShareLinkService {
    private final SecureRandom random = new SecureRandom();
    private final PageShareLinkRepository links;
    private final PageAuthorizationService authorization;
    private final PageContentService content;

    public PageShareLinkService(PageShareLinkRepository links, PageAuthorizationService authorization,
                                PageContentService content) {
        this.links = links;
        this.authorization = authorization;
        this.content = content;
    }

    public List<PageShareLink> list(UUID page, UUID actor) {
        authorization.requireOwner(page, actor);
        return links.list(page);
    }

    @Transactional
    public PageShareLink.Created create(UUID page, UUID actor, PageAccessLevel permission, Instant expiresAt) {
        lockOwner(page, actor);
        String role = PageSharingService.role(permission);
        validateExpiration(expiresAt);
        byte[] secret = new byte[32];
        random.nextBytes(secret);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(secret);
        links.revokeAll(page);
        return new PageShareLink.Created(links.create(page, actor, role, hash(token), expiresAt), token);
    }

    @Transactional
    public void change(UUID page, UUID actor, UUID link, PageAccessLevel permission, Instant expiresAt) {
        lockOwner(page, actor);
        validateExpiration(expiresAt);
        if (!links.change(page, link, PageSharingService.role(permission), expiresAt)) throw new PageNotFound();
    }

    @Transactional
    public void revoke(UUID page, UUID actor, UUID link) {
        lockOwner(page, actor);
        if (!links.revoke(page, link)) throw new PageNotFound();
    }

    public PageShareLink.Target resolve(String token) {
        if (token.length() != 43 || !token.matches("[A-Za-z0-9_-]+")) throw new PageNotFound();
        var target = links.find(hash(token)).orElseThrow(PageNotFound::new);
        var link = target.link();
        if (link.revokedAt() != null || (link.expiresAt() != null && !link.expiresAt().isAfter(Instant.now()))) {
            throw new PageAccessException.Gone();
        }
        return target;
    }

    public PageContent snapshot(PageShareLink.Target target) {
        return content.snapshot(target.pageId());
    }

    @Transactional
    public PageContent.Revision save(String token, UUID actor, JsonNode snapshot, Long version) {
        if (actor == null) throw new PageAccessException.Forbidden();
        // Link mutations and direct autosaves serialize on this same page row.
        var target = resolve(token);
        authorization.requireEditor(target.link().permission());
        UUID page = target.pageId();
        authorization.lockPage(page);
        authorization.requireEditor(resolve(token).link().permission());
        return content.updateLocked(page, snapshot, version);
    }

    private void lockOwner(UUID page, UUID actor) {
        authorization.requireOwner(page, actor);
        authorization.lockPage(page);
    }

    private void validateExpiration(Instant expiration) {
        if (expiration != null && !expiration.isAfter(Instant.now())) {
            throw new PageAccessException.Invalid("A expiração deve estar no futuro.");
        }
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.US_ASCII)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException(error);
        }
    }
}
