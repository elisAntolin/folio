package com.folio.backend.application.event;

import java.util.UUID;

public record OwnedPagesChanged(UUID ownerId) {}
