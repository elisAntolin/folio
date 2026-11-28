package com.folio.backend.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

final class BrowserAuthRequestFilter extends OncePerRequestFilter {
    static final String[] PATHS = {
            "/api/users/register", "/api/users/login", "/api/tokens/refresh", "/api/tokens/logout"
    };
    private final RequestMatcher browserAuth = new OrRequestMatcher(Arrays.stream(PATHS)
            .map(path -> PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, path))
            .map(RequestMatcher.class::cast)
            .toList());

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !browserAuth.matches(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // This header requires a preflight cross-origin. These endpoints do not grant CORS access.
        String site = request.getHeader("Sec-Fetch-Site");
        if (!"1".equals(request.getHeader("X-Folio-CSRF")) || (site != null && !"same-origin".equals(site))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        chain.doFilter(request, response);
    }
}
