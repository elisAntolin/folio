package com.folio.backend.presentation.dto.response;

import com.folio.backend.domain.model.Page;

import java.util.UUID;

public record PageSummaryResponse(
        UUID id,
        UUID categoryId,
        String title,
        String coverImageUrl
) {
    public static PageSummaryResponse from(Page page){
        return new PageSummaryResponse(page.getId(), page.getCategoryId(), page.getTitle(),page.getCoverImageUrl());
    }
}