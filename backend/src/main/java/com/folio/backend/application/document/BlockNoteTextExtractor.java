package com.folio.backend.application.document;

import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

@Component
public class BlockNoteTextExtractor {
    public String extract(JsonNode document) {
        StringBuilder text = new StringBuilder();
        appendBlocks(document, text);
        return text.toString().strip();
    }

    private void appendBlocks(JsonNode blocks, StringBuilder text) {
        if (!blocks.isArray()) return;

        for (JsonNode block : blocks) {
            appendContent(block.path("content"), text);
            text.append('\n');
            appendBlocks(block.path("children"), text);
        }
    }

    private void appendContent(JsonNode content, StringBuilder text) {
        if (content.isTextual()) {
            text.append(content.asText());
            return;
        }

        if (content.isArray()) {
            for (JsonNode segment : content) {
                appendContent(segment, text);
            }
            return;
        }

        if (!content.isObject()) return;

        switch (content.path("type").asText()) {
            case "text" -> appendContent(content.path("text"), text);
            case "tableContent" -> appendTable(content.path("rows"), text);
            default -> appendContent(content.path("content"), text);
        }
    }

    private void appendTable(JsonNode rows, StringBuilder text) {
        if (!rows.isArray()) return;

        for (JsonNode row : rows) {
            JsonNode cells = row.path("cells");
            if (!cells.isArray()) continue;

            for (JsonNode cell : cells) {
                appendContent(cell, text);
                text.append('\t');
            }
            text.append('\n');
        }
    }
}
