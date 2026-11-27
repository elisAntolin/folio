package com.folio.backend.domain.model;

import com.folio.backend.domain.validation.Validation;

import java.time.LocalDateTime;
import java.util.UUID;

public class Page {
    private static final int MAX_TITLE_LENGTH = 255;
    private final UUID id, ownerId, parentId;
    private UUID categoryId;
    private String title;
    private String coverImageUrl;

    private LocalDateTime deletedAt;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastEditedAt;

    public Page(
            UUID ownerId,
            UUID categoryId,
            UUID parentId,
            String title,
            String coverImageUrl
    ) {
        LocalDateTime now = LocalDateTime.now();

        this.id = UUID.randomUUID();
        this.ownerId = Validation.notNull(ownerId, "Owner ID");
        this.categoryId = categoryId;
        this.parentId = parentId;
        this.title = validateTitle(title);
        this.coverImageUrl = Validation.notBlankIfPresent(
                coverImageUrl, "Cover image URL"
        );

        this.deletedAt = null;
        this.createdAt = now;
        this.updatedAt = now;
        this.lastEditedAt = now;
    }


    public Page(
            UUID id,
            UUID ownerId,
            UUID categoryId,
            UUID parentId,
            String title,
            String coverImageUrl,
            LocalDateTime deletedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime lastEditedAt
    ) {
        this.id = Validation.notNull(id, "ID");
        this.ownerId = Validation.notNull(ownerId, "Owner ID");
        this.categoryId = categoryId;
        this.parentId = parentId;
        this.title = validateTitle(title);
        this.coverImageUrl = Validation.notBlankIfPresent(
                coverImageUrl, "Cover image URL"
        );

        this.deletedAt = deletedAt;
        this.createdAt = Validation.notNull(createdAt, "Created at");
        this.updatedAt = Validation.notNull(updatedAt, "Updated at");
        this.lastEditedAt = Validation.notNull(lastEditedAt, "Last edited at");
    }

    private static String validateTitle(String title){
        Validation.notBlank(title, "Titulo");
        Validation.maxLength(title, MAX_TITLE_LENGTH, "Titulo");
        return title;
    }

    public void rename(String title) {
        this.title = validateTitle(title);
        this.updatedAt = LocalDateTime.now();
    }

    public void changeCategory(UUID categoryId) {
        this.categoryId = categoryId;
        this.updatedAt = LocalDateTime.now();
    }
    public boolean isDeleted(){
        return deletedAt != null;
    }
    public void delete(UUID userId){
        if(isDeleted())
            throw new IllegalStateException("Pagina ja excluida");
        if(!ownerId.equals(userId))
            throw new IllegalArgumentException("Voce nao tem permissao necessaria para deletar");
        LocalDateTime now = LocalDateTime.now();
        deletedAt = now;
        updatedAt = now;
    }
    public UUID getId() {
        return id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public UUID getParentId() {
        return parentId;
    }

    public String getTitle() {
        return title;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getLastEditedAt() {
        return lastEditedAt;
    }

}
