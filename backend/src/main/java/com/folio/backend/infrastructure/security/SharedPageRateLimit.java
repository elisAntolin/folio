package com.folio.backend.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

final class SharedPageRateLimit extends OncePerRequestFilter {
    private final Map<String, Integer> counts = new HashMap<>();
    private long minute = -1;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/api/shared/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!allow(request.getRemoteAddr())) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setHeader("Cache-Control", "no-store");
            return;
        }
        chain.doFilter(request, response);
    }

    private synchronized boolean allow(String client) {
        long now = System.currentTimeMillis() / 60_000;
        if (minute != now) {
            counts.clear();
            minute = now;
        }
        if (counts.size() >= 10_000 && !counts.containsKey(client)) return false;
        int count = counts.getOrDefault(client, 0);
        if (count >= 120) return false;
        counts.put(client, count + 1);
        return true;
    }
}
