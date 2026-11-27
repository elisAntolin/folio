package com.folio.backend.presentation.controller;

import com.folio.backend.application.document.PageContent;
import com.folio.backend.application.service.PageShareLinkService;
import com.folio.backend.application.sharing.PageAccessLevel;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import com.folio.backend.presentation.dto.request.UpdatePageContentRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/shared/{token}")
public class SharedPageController {
    private final PageShareLinkService service;
    public SharedPageController(PageShareLinkService service) { this.service = service; }

    public record SharedPage(UUID id, String title, String coverImageUrl, PageAccessLevel permission) {}

    @GetMapping
    public ResponseEntity<SharedPage> page(@PathVariable String token, @AuthenticationPrincipal AuthenticatedUser user) {
        var target = service.resolve(token);
        if (target.link().permission().canEdit() && user == null) return response(401).build();
        return response(200).body(new SharedPage(target.pageId(), target.title(), target.coverImageUrl(),
                target.link().permission()));
    }

    @GetMapping("/content")
    public ResponseEntity<PageContent> content(@PathVariable String token,
            @AuthenticationPrincipal AuthenticatedUser user) {
        var target = service.resolve(token);
        boolean canEdit = target.link().permission().canEdit();
        if (canEdit && user == null) return response(401).build();
        var headers = response(200).header("X-Folio-Can-Edit", Boolean.toString(canEdit));
        if (user != null) headers.header("X-Folio-User-Id", user.id().toString());
        return headers.body(service.snapshot(target));
    }

    @PutMapping("/content")
    public ResponseEntity<PageContent.Revision> save(@PathVariable String token, @RequestBody UpdatePageContentRequest input,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) return response(401).build();
        return response(200).body(service.save(token, user.id(), input.content(), input.version()));
    }

    private ResponseEntity.BodyBuilder response(int status) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore())
                .header("Referrer-Policy", "no-referrer");
    }
}
