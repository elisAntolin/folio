package com.folio.backend.infrastructure.cache;

import com.github.benmanes.caffeine.cache.Cache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;

final class QueryCacheMetrics {
    private static final Logger LOG = LoggerFactory.getLogger(QueryCacheMetrics.class);

    private final Cache<?, ?> pages;
    private final Cache<?, ?> categories;

    QueryCacheMetrics(Cache<?, ?> pages, Cache<?, ?> categories) {
        this.pages = pages;
        this.categories = categories;
    }

    @Scheduled(fixedDelayString = "${folio.query-cache.metrics-interval:PT5M}",
            initialDelayString = "${folio.query-cache.metrics-interval:PT5M}")
    void report() {
        report("owned-pages", pages);
        report("categories", categories);
    }

    private void report(String name, Cache<?, ?> cache) {
        var stats = cache.stats();
        if (stats.requestCount() == 0) return;

        LOG.info("query_cache={} hits={} misses={} hit_rate={} entries={} evictions={} load_failures={} avg_load_ms={}",
                name, stats.hitCount(), stats.missCount(), stats.hitRate(), cache.estimatedSize(),
                stats.evictionCount(), stats.loadFailureCount(), stats.averageLoadPenalty() / 1_000_000);
    }
}
