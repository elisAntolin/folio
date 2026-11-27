package com.folio.backend.application.sharing;

import java.util.UUID;

public record PageSummary(UUID id, UUID categoryId, String title, String coverImageUrl,
                          PageAccessLevel permission, boolean favorite) {}
