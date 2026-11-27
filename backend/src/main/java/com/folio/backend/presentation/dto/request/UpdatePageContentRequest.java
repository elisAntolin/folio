package com.folio.backend.presentation.dto.request;

import tools.jackson.databind.JsonNode;

public record UpdatePageContentRequest(JsonNode content, Long version) {}
