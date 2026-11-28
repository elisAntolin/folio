package com.folio.backend.presentation.controller;

import com.folio.backend.application.service.RefreshTokenService.SessionToken;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

record SessionResponse(String accessToken, String email, UUID id) {
    static final String COOKIE_NAME = "__Host-folio-refresh";

    static ResponseEntity<SessionResponse> issue(
            HttpStatus status, String accessToken, String email, SessionToken refreshToken) {
        return ResponseEntity.status(status)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, cookie(refreshToken.value()).build().toString())
                .body(new SessionResponse(accessToken, email, refreshToken.sessionId()));
    }

    static ResponseEntity.BodyBuilder clear(HttpStatus status) {
        return ResponseEntity.status(status)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, cookie("").maxAge(0).build().toString());
    }

    private static ResponseCookie.ResponseCookieBuilder cookie(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/");
    }
}
