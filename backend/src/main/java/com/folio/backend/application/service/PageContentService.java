package com.folio.backend.application.service;

import com.folio.backend.application.document.BlockNoteTextExtractor;
import com.folio.backend.application.document.PageContent;
import com.folio.backend.application.document.PageNotFound;
import com.folio.backend.infrastructure.repository.PageContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.util.UUID;

@Service
public class PageContentService {
    private final PageContentRepository repository;
    private final BlockNoteTextExtractor extractor;
    private final PageAuthorizationService authorization;

    public PageContentService(PageContentRepository repository, BlockNoteTextExtractor extractor,
                              PageAuthorizationService authorization) {
        this.repository = repository;
        this.extractor = extractor;
        this.authorization = authorization;
    }

    public PageContent.Access find(UUID pageId, UUID userId) {
        boolean canEdit = authorization.requireAccess(pageId, userId).canEdit();
        return new PageContent.Access(snapshot(pageId), canEdit);
    }

    @Transactional
    public PageContent.Revision update(UUID pageId, UUID userId, JsonNode content, Long version) {
        authorization.requireEditor(authorization.requireAccess(pageId, userId));
        authorization.lockPage(pageId);
        authorization.requireEditor(authorization.requireAccess(pageId, userId));
        return updateLocked(pageId, content, version);
    }

    PageContent snapshot(UUID pageId) {
        return repository.find(pageId).orElseThrow(PageNotFound::new);
    }

    PageContent.Revision updateLocked(UUID pageId, JsonNode content, Long version) {
        if (content == null || !content.isArray() || version == null || version < 1) {
            throw new InvalidSnapshot();
        }
        for (JsonNode block : content) {
            if (!block.isObject() || !block.path("type").isTextual()) throw new InvalidSnapshot();
        }

        String text = extractor.extract(content);
        PageContent.Revision revision = repository.update(pageId, content, text, version)
                .orElseThrow(() -> new Conflict(snapshot(pageId).version()));
        repository.markEdited(pageId, revision.updatedAt());
        return revision;
    }

    public static class InvalidSnapshot extends RuntimeException {}

    public static class Conflict extends RuntimeException {
        private final long currentVersion;

        public Conflict(long currentVersion) {
            this.currentVersion = currentVersion;
        }

        public long currentVersion() {
            return currentVersion;
        }
    }
}
