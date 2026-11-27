package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.PageService;
import com.folio.backend.domain.model.Page;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import com.folio.backend.presentation.dto.request.CreatePageRequest;
import com.folio.backend.presentation.dto.request.UpdatePageRequest;
import com.folio.backend.presentation.dto.response.CreatePageResponse;
import com.folio.backend.presentation.dto.response.PageSummaryResponse;
import org.springframework.security.core.Authentication;
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

    public PageController(PageService pageService) {
        this.pageService = pageService;
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
