package com.folio.backend.presentation.controller;

import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.application.service.PageContentService;
import com.folio.backend.application.sharing.PageAccessException;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class PageAccessAdvice {
    @ExceptionHandler(PageNotFound.class)
    public ResponseEntity<Map<String, String>> notFound(PageNotFound error) {
        return response(404, error);
    }

    @ExceptionHandler(PageAccessException.class)
    public ResponseEntity<Map<String, String>> accessError(PageAccessException error) {
        int status = switch (error) {
            case PageAccessException.Forbidden ignored -> 403;
            case PageAccessException.Gone ignored -> 410;
            case PageAccessException.Conflict ignored -> 409;
            default -> 400;
        };
        return response(status, error);
    }

    @ExceptionHandler(PageContentService.InvalidSnapshot.class)
    public ResponseEntity<Void> invalidSnapshot() {
        return ResponseEntity.badRequest().build();
    }

    @ExceptionHandler(PageContentService.Conflict.class)
    public ResponseEntity<Map<String, Object>> contentConflict(PageContentService.Conflict conflict) {
        return ResponseEntity.status(409).cacheControl(CacheControl.noStore()).body(Map.of(
                "code", "CONTENT_VERSION_CONFLICT", "message", "O documento foi modificado por outra sessão.",
                "currentVersion", conflict.currentVersion()));
    }

    private ResponseEntity<Map<String, String>> response(int status, RuntimeException error) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore())
                .header("Referrer-Policy", "no-referrer").body(Map.of("message", error.getMessage()));
    }
}
