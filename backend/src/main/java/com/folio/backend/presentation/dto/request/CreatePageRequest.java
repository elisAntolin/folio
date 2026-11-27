package com.folio.backend.presentation.dto.request;

import java.util.UUID;

public record CreatePageRequest(
        String title,
        UUID categoryId,
        UUID parentId
) {}
