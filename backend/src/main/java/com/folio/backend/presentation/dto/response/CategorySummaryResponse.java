package com.folio.backend.presentation.dto.response;

import com.folio.backend.domain.model.Category;

import java.util.UUID;

public record CategorySummaryResponse(UUID id, String name) {
    public static CategorySummaryResponse from(Category category) {
        return new CategorySummaryResponse(category.id(), category.name());
    }
}
