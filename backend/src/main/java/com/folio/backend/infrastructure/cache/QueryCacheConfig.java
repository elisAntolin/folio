package com.folio.backend.infrastructure.cache;

import com.folio.backend.application.service.CategoryQueries;
import com.folio.backend.application.service.PageQueries;
import com.folio.backend.application.sharing.PageSummary;
import com.folio.backend.domain.model.Category;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Scheduler;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;
import java.util.List;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "folio.query-cache.enabled", havingValue = "true", matchIfMissing = true)
public class QueryCacheConfig {
    @Bean
    Cache<CachedPageQueries.Key, List<PageSummary>> ownedPageCache() {
        return Caffeine.newBuilder()
                .maximumWeight(8 * 1024 * 1024)
                .weigher((CachedPageQueries.Key key, List<PageSummary> rows) -> weight(rows))
                .expireAfterWrite(Duration.ofSeconds(20))
                .scheduler(Scheduler.systemScheduler())
                .recordStats()
                .build();
    }

    @Bean
    Cache<CachedCategoryQueries.Key, List<Category>> categoryCache() {
        return Caffeine.newBuilder()
                .maximumWeight(2 * 1024 * 1024)
                .weigher((CachedCategoryQueries.Key key, List<Category> rows) ->
                        boundedWeight(256 + rows.stream().mapToLong(row -> 128 + stringWeight(row.name())).sum()))
                .expireAfterWrite(Duration.ofMinutes(2))
                .scheduler(Scheduler.systemScheduler())
                .recordStats()
                .build();
    }

    @Bean
    @Primary
    CachedPageQueries cachedPageQueries(@Qualifier("pageOrganizationService") PageQueries delegate,
                                      @Qualifier("ownedPageCache") Cache<CachedPageQueries.Key, List<PageSummary>> cache) {
        return new CachedPageQueries(delegate, cache);
    }

    @Bean
    @Primary
    CachedCategoryQueries cachedCategoryQueries(@Qualifier("categoryService") CategoryQueries delegate,
            @Qualifier("categoryCache") Cache<CachedCategoryQueries.Key, List<Category>> cache) {
        return new CachedCategoryQueries(delegate, cache);
    }

    private static int weight(List<PageSummary> rows) {
        // Covers can contain base64 images. Include the string size in the memory budget.
        return boundedWeight(256 + rows.stream().mapToLong(row ->
                192 + stringWeight(row.title()) + stringWeight(row.coverImageUrl())).sum());
    }

    private static long stringWeight(String value) {
        return value == null ? 0 : 2L * value.length();
    }

    private static int boundedWeight(long weight) {
        return (int) Math.min(weight, Integer.MAX_VALUE);
    }
}
