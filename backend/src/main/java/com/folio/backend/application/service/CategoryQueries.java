package com.folio.backend.application.service;

import com.folio.backend.domain.model.Category;

import java.util.List;
import java.util.UUID;

public interface CategoryQueries {
    List<Category> findAll(UUID owner);
}
