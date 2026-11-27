package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.PageService;
import com.folio.backend.application.document.PageContent;
import com.folio.backend.application.service.PageContentService;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import com.folio.backend.presentation.dto.request.CreatePageRequest;
import com.folio.backend.presentation.dto.request.UpdatePageRequest;
import com.folio.backend.presentation.dto.response.CreatePageResponse;
import com.folio.backend.presentation.dto.response.PageSummaryResponse;
import com.folio.backend.presentation.dto.request.UpdatePageContentRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
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

    @GetMapping("/recent")
    public ResponseEntity<List<PageSummaryResponse>> findRecent(@AuthenticationPrincipal AuthenticatedUser authenticatedUser){
        String email = authenticatedUser.email();
        return  ResponseEntity.ok(pageService.findRecents(email));
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

    @GetMapping("/{pageId}/content")
    public ResponseEntity<PageContent> getContent(
            @PathVariable UUID pageId, @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header("X-Folio-User-Id", user.id().toString())
                .body(contentService.find(pageId, user.id()));
    }

    @PutMapping("/{pageId}/content")
    public ResponseEntity<PageContent.Revision> updateContent(
            @PathVariable UUID pageId, @RequestBody UpdatePageContentRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(contentService.update(pageId, user.id(), request.content(), request.version()));
    }

    @ExceptionHandler(PageContentService.NotFound.class)
    public ResponseEntity<Void> contentNotFound() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(PageContentService.InvalidSnapshot.class)
    public ResponseEntity<Void> invalidSnapshot() {
        return ResponseEntity.badRequest().build();
    }

    @ExceptionHandler(PageContentService.Conflict.class)
    public ResponseEntity<ContentConflict> contentConflict(PageContentService.Conflict conflict) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ContentConflict(
                "CONTENT_VERSION_CONFLICT", "O documento foi modificado por outra sessão.",
                conflict.currentVersion()));
    }

    public record ContentConflict(String code, String message, long currentVersion) {}

    @GetMapping("/search")
    public ResponseEntity<List<PageSummaryResponse>> search(
            @RequestParam("q") String query,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ){
        return ResponseEntity.ok(
                pageService.searchPages(query, authenticatedUser.id())
        );
    }
}
