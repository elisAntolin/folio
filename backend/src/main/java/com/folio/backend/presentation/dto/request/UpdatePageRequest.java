package com.folio.backend.presentation.dto.request;

import java.util.UUID;

public record UpdatePageRequest(
        String title,
        UUID categoryId
) {}