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

    public PageContentService(PageContentRepository repository, BlockNoteTextExtractor extractor) {
        this.repository = repository;
        this.extractor = extractor;
    }

    public PageContent find(UUID pageId, UUID ownerId) {
        return repository.find(pageId, ownerId).orElseThrow(PageNotFound::new);
    }

    @Transactional
    public PageContent.Revision update(UUID pageId, UUID ownerId, JsonNode content, Long version) {
        if (content == null || !content.isArray() || version == null || version < 1) {
            throw new InvalidSnapshot();
        }
        for (JsonNode block : content) {
            if (!block.isObject() || !block.path("type").isTextual()) throw new InvalidSnapshot();
        }

        String text = extractor.extract(content);
        if (!repository.lockOwnedPage(pageId, ownerId)) throw new PageNotFound();

        PageContent.Revision revision = repository.update(pageId, ownerId, content, text, version)
                .orElseThrow(() -> new Conflict(find(pageId, ownerId).version()));
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
