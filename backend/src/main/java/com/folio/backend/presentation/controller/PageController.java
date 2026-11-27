package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.PageService;
import com.folio.backend.application.document.PageContent;
import com.folio.backend.application.service.PageContentService;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import com.folio.backend.presentation.dto.request.CreatePageRequest;
import com.folio.backend.presentation.dto.request.UpdatePageRequest;
import com.folio.backend.presentation.dto.response.CreatePageResponse;
import com.folio.backend.presentation.dto.request.UpdatePageContentRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages")
public class PageController {
    private final PageService pageService;

    private final PageContentService contentService;

    public PageController(PageService pageService, PageContentService contentService) {
        this.pageService = pageService;
        this.contentService = contentService;
    }

    @PostMapping
    public ResponseEntity<CreatePageResponse> create(
            @RequestBody CreatePageRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ){
        UUID pageId = pageService.createPage(
                request.title(),
                request.categoryId(),
                authenticatedUser.id()
        );
        return ResponseEntity.created(URI.create("/api/pages/" + pageId))
                .body(new CreatePageResponse(pageId));

    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable UUID id,
            @RequestBody UpdatePageRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ){
        pageService.editPage(id,request.title(), request.categoryId(), authenticatedUser.id());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ){
        pageService.deletePage(id, authenticatedUser.id());
        return ResponseEntity.noContent().build();
    }

    public record Rename(String title) {}
    public record Cover(String coverImageUrl) {}

    @PatchMapping("/{id}/title")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rename(@PathVariable UUID id, @RequestBody Rename input,
            @AuthenticationPrincipal AuthenticatedUser user) {
        pageService.rename(id, user.id(), input.title());
    }

    @PatchMapping("/{id}/cover")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cover(@PathVariable UUID id, @RequestBody Cover input,
            @AuthenticationPrincipal AuthenticatedUser user) {
        pageService.changeCover(id, user.id(), input.coverImageUrl());
    }

    @GetMapping("/{pageId}/content")
    public ResponseEntity<PageContent> getContent(
            @PathVariable UUID pageId, @AuthenticationPrincipal AuthenticatedUser user) {
        PageContent.Access access = contentService.find(pageId, user.id());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header("X-Folio-User-Id", user.id().toString())
                .header("X-Folio-Can-Edit", Boolean.toString(access.canEdit()))
                .body(access.snapshot());
    }

    @PutMapping("/{pageId}/content")
    public ResponseEntity<PageContent.Revision> updateContent(
            @PathVariable UUID pageId, @RequestBody UpdatePageContentRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(contentService.update(pageId, user.id(), request.content(), request.version()));
    }

}
