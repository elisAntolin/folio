package com.folio.backend.application.service;

import com.folio.backend.application.sharing.PageSummary;

import java.util.List;
import java.util.UUID;

public interface PageQueries {
    enum Scope { OWNED, SHARED, FAVORITES }

    PageSummary find(UUID page, UUID user);

    List<PageSummary> list(UUID user, Scope scope, UUID category, boolean uncategorized, int page, int size);

    List<PageSummary> search(String query, UUID user, UUID category, boolean uncategorized, boolean favorites);
}
