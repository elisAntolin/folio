package com.folio.backend;

import com.folio.backend.application.service.JwtService;
import com.folio.backend.application.service.PageService;
import com.folio.backend.infrastructure.repository.PageContentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PageContentIntegrationTests {
    private static final String DOCUMENT = """
            [{"id":"internal-id","type":"heading","props":{"textColor":"magenta"},"content":[
                {"type":"text","text":"astro","styles":{"bold":true}},
                {"type":"text","text":"nomia "},
                {"type":"link","href":"https://internal.example","content":[{"type":"text","text":"espacial"}]}],
              "children":[{"type":"bulletListItem","content":[{"type":"text","text":"nebulosa"}]}]},
             {"type":"table","content":{"type":"tableContent","rows":[
                {"cells":[[{"type":"text","text":"galáxia"}],
                 {"type":"tableCell","content":[{"type":"text","text":"constelação"}]}]}]}}]
            """;

    @Autowired JdbcTemplate jdbc;
    @Autowired JsonMapper json;
    @Autowired PageService pages;
    @Autowired JwtService jwt;
    @MockitoSpyBean PageContentRepository contentRepository;
    @LocalServerPort int port;

    private final HttpClient http = HttpClient.newHttpClient();
    private UUID ownerId;
    private UUID otherId;
    private UUID pageId;
    private String ownerToken;
    private String otherToken;

    @BeforeEach
    void setUp() {
        String ownerEmail = UUID.randomUUID() + "@example.test";
        String otherEmail = UUID.randomUUID() + "@example.test";
        ownerId = createUser(ownerEmail);
        otherId = createUser(otherEmail);
        ownerToken = jwt.generateToken(ownerEmail);
        otherToken = jwt.generateToken(otherEmail);
        pageId = pages.createPage("Página de teste", null, ownerId);
    }

    @AfterEach
    void cleanUp() {
        jdbc.update("DELETE FROM pages WHERE owner_user_id IN (?, ?)", ownerId, otherId);
        jdbc.update("DELETE FROM users WHERE id IN (?, ?)", ownerId, otherId);
    }

    @Test
    void createsAndPersistsVersionedContentAndIndexesOnlyText() throws Exception {
        var initial = send("GET", null, ownerToken);
        assertEquals(200, initial.statusCode());
        assertEquals(ownerId.toString(), initial.headers().firstValue("X-Folio-User-Id").orElseThrow());
        assertEquals(1, body(initial).get("version").asLong());
        assertTrue(body(initial).get("content").isEmpty());
        assertTrue(initial.headers().firstValue("Cache-Control").orElse("").contains("no-store"));

        jdbc.update("UPDATE pages SET last_edited_at = '2020-01-01' WHERE id = ?", pageId);
        var saved = send("PUT", snapshot(DOCUMENT, 1), ownerToken);
        assertEquals(200, saved.statusCode());
        assertEquals(2, body(saved).get("version").asLong());
        var loaded = body(send("GET", null, ownerToken));
        assertEquals(json.readTree(DOCUMENT), loaded.get("content"));
        assertEquals(body(saved).get("updatedAt"), loaded.get("updatedAt"));

        assertEquals("astronomia espacial\nnebulosa\ngaláxia\tconstelação", jdbc.queryForObject(
                "SELECT content_text FROM page_contents WHERE page_id = ?", String.class, pageId));
        assertEquals(LocalDateTime.parse(loaded.get("updatedAt").asText()), jdbc.queryForObject(
                "SELECT last_edited_at FROM pages WHERE id = ?", LocalDateTime.class, pageId));
        for (String term : List.of("astronomia", "nebulosa", "constelação")) {
            assertEquals(pageId, pages.searchPages(term, ownerId).getFirst().id());
        }
        for (String term : List.of("magenta", "internal", "example")) {
            assertTrue(pages.searchPages(term, ownerId).isEmpty());
        }
    }

    @Test
    void validatesVersionBeforeWritingAndProtectsOtherAndDeletedPages() throws Exception {
        assertEquals(400, send("PUT", snapshot("{}", 1), ownerToken).statusCode());
        assertEquals(400, send("PUT", snapshot("[]", 0), ownerToken).statusCode());
        assertEquals(404, send("GET", null, otherToken).statusCode());
        assertEquals(404, send("PUT", snapshot(DOCUMENT, 1), otherToken).statusCode());
        pages.deletePage(pageId, ownerId);
        assertEquals(404, send("GET", null, ownerToken).statusCode());
        assertEquals(404, send("PUT", snapshot(DOCUMENT, 1), ownerToken).statusCode());
    }

    @Test
    void acceptsOnlyOneConcurrentUpdateWithSameVersion() throws Exception {
        var first = http.sendAsync(request("PUT", snapshot(DOCUMENT, 1), ownerToken),
                HttpResponse.BodyHandlers.ofString());
        var second = http.sendAsync(request("PUT", snapshot("[]", 1), ownerToken),
                HttpResponse.BodyHandlers.ofString());
        var a = first.get();
        var b = second.get();
        assertEquals(List.of(200, 409), List.of(a.statusCode(), b.statusCode()).stream().sorted().toList());
        var conflict = body(a.statusCode() == 409 ? a : b);
        assertEquals("CONTENT_VERSION_CONFLICT", conflict.get("code").asText());
        assertEquals(2, conflict.get("currentVersion").asLong());
        var loaded = body(send("GET", null, ownerToken));
        assertEquals(2, loaded.get("version").asLong());
        assertEquals(json.readTree(a.statusCode() == 200 ? DOCUMENT : "[]"), loaded.get("content"));
    }

    @Test
    void rollsBackContentWhenPageTimestampUpdateFails() throws Exception {
        var before = body(send("GET", null, ownerToken));
        doThrow(new IllegalStateException("Update failed")).when(contentRepository).markEdited(eq(pageId), any());
        assertThrows(IllegalStateException.class, () ->
                // Execute the same transactional service used by the endpoint.
                contentService.update(pageId, ownerId, json.readTree(DOCUMENT), 1L));
        assertEquals(before, body(send("GET", null, ownerToken)));
        assertTrue(pages.searchPages("astronomia", ownerId).isEmpty());
    }

    @Autowired com.folio.backend.application.service.PageContentService contentService;

    private UUID createUser(String email) {
        return jdbc.queryForObject(
                "INSERT INTO users (email, password_hash) VALUES (?, '') RETURNING id", UUID.class, email);
    }

    private String snapshot(String content, int version) {
        return "{\"content\":" + content + ",\"version\":" + version + "}";
    }

    private HttpRequest request(String method, String payload, String token) {
        return HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/pages/" + pageId + "/content"))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .method(method, payload == null ? HttpRequest.BodyPublishers.noBody()
                        : HttpRequest.BodyPublishers.ofString(payload))
                .build();
    }

    private HttpResponse<String> send(String method, String payload, String token) throws Exception {
        return http.send(request(method, payload, token), HttpResponse.BodyHandlers.ofString());
    }

    private JsonNode body(HttpResponse<String> response) {
        return json.readTree(response.body());
    }
}
