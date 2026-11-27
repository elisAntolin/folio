package com.folio.backend.presentation.controller;

import com.folio.backend.application.document.PageNotFound;
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

    private ResponseEntity<Map<String, String>> response(int status, RuntimeException error) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore())
                .header("Referrer-Policy", "no-referrer").body(Map.of("message", error.getMessage()));
    }
}
