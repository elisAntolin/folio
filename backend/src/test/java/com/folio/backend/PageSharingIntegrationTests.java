package com.folio.backend;

import com.folio.backend.application.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PageSharingIntegrationTests {
    private record Account(UUID id, String email, String token) {}

    @Autowired JdbcTemplate jdbc;
    @Autowired JwtService jwt;
    @Autowired JsonMapper json;
    @LocalServerPort int port;
    private final HttpClient http = HttpClient.newHttpClient();
    private Account owner;
    private Account member;
    private String page;

    @BeforeEach
    void setup() throws Exception {
        owner = account();
        member = account();
        page = create(owner, "Astronomia", null);
    }

    @AfterEach
    void cleanup() {
        jdbc.update("UPDATE pages SET parent_page_id = NULL WHERE owner_user_id IN (?, ?)", owner.id(), member.id());
        jdbc.update("DELETE FROM pages WHERE owner_user_id IN (?, ?)", owner.id(), member.id());
        jdbc.update("DELETE FROM users WHERE id IN (?, ?)", owner.id(), member.id());
    }

    @Test
    void directSharingControlsEditingSearchFavoritesAndRevocation() throws Exception {
        String permissions = path(page) + "/permissions";
        expect(400, send("POST", permissions, owner, invite("missing@example.test", "EDITOR")));
        expect(400, send("POST", permissions, owner, invite(owner.email(), "EDITOR")));
        expect(400, send("POST", permissions, owner, invite(member.email(), "OWNER")));
        expect(404, send("POST", permissions, member, invite(owner.email(), "EDITOR")));
        expect(201, send("POST", permissions, owner, invite(member.email(), "VIEWER")));
        expect(409, send("POST", permissions, owner, invite(member.email(), "VIEWER")));
        expect(403, send("GET", permissions, member, null));
        assertEquals(2, json(send("GET", permissions, owner, null)).size());
        assertEquals(page, id(json(send("GET", "/pages/shared-with-me", member, null)).get(0)));

        String content = path(page) + "/content";
        assertEquals("false", send("GET", content, member, null).headers()
                .firstValue("X-Folio-Can-Edit").orElseThrow());
        expect(403, send("PUT", content, member, snapshot(1)));
        expect(403, send("PATCH", path(page) + "/title", member, "{\"title\":\"Estrelas\"}"));

        String grant = permissions + "/" + member.id();
        expect(204, send("PATCH", grant, owner, "{\"permission\":\"EDITOR\"}"));
        expect(200, send("PUT", content, member, snapshot(1)));
        expect(409, send("PUT", content, owner, snapshot(1)));
        expect(204, send("PATCH", path(page) + "/title", member, "{\"title\":\"Astronomia observacional\"}"));
        expect(204, send("PATCH", path(page) + "/cover", member, "{\"coverImageUrl\":\"#123456\"}"));
        expect(403, send("PATCH", path(page), member, "{\"title\":\"Tentativa de categoria\",\"categoryId\":null}"));
        expect(403, send("DELETE", path(page), member, null));

        String favorite = path(page) + "/favorite";
        expect(204, send("PUT", favorite, member, null));
        expect(204, send("PUT", favorite, member, null));
        assertEquals(1, json(send("GET", "/pages/favorites", member, null)).size());
        assertTrue(json(send("GET", "/pages/favorites", owner, null)).isEmpty());
        assertEquals(page, id(json(send("GET", "/pages/search?q=nebulosa&favoritesOnly=true", member, null)).get(0)));
        expect(204, send("DELETE", favorite, member, null));
        assertTrue(json(send("GET", "/pages/favorites", member, null)).isEmpty());
        expect(204, send("PUT", favorite, member, null));

        expect(204, send("PATCH", grant, owner, "{\"permission\":\"VIEWER\"}"));
        expect(403, send("PUT", content, member, snapshot(2)));
        expect(204, send("DELETE", grant, owner, null));
        expect(404, send("GET", content, member, null));
        expect(404, send("PUT", favorite, member, null));
        for (String endpoint : List.of("/pages/shared-with-me", "/pages/favorites", "/pages/search?q=nebulosa")) {
            assertTrue(json(send("GET", endpoint, member, null)).isEmpty());
        }

        expect(204, send("DELETE", path(page), owner, null));
        expect(404, send("POST", permissions, owner, invite(member.email(), "VIEWER")));
    }

    @Test
    void publicLinksAreStoredAsHashesAndRespectIdentityExpiryAndRegeneration() throws Exception {
        String linkPath = path(page) + "/share-links";
        JsonNode created = json(expect(201, send("POST", linkPath, owner, "{\"permission\":\"VIEWER\"}")));
        String token = created.get("token").asText();
        String link = id(created.get("link"));
        assertEquals(32, Base64.getUrlDecoder().decode(token).length);
        assertEquals(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                        .digest(token.getBytes(StandardCharsets.US_ASCII))),
                jdbc.queryForObject("SELECT token_hash FROM page_share_links WHERE id = ?", String.class, UUID.fromString(link)));
        assertFalse(send("GET", linkPath, owner, null).body().contains(token));

        String shared = "/shared/" + token;
        expect(200, send("GET", shared, null, null));
        var view = expect(200, send("GET", shared + "/content", null, null));
        assertEquals("no-referrer", view.headers().firstValue("Referrer-Policy").orElseThrow());
        assertEquals("false", view.headers().firstValue("X-Folio-Can-Edit").orElseThrow());
        expect(401, send("PUT", shared + "/content", null, snapshot(1)));
        expect(403, send("PUT", shared + "/content", member, snapshot(1)));

        expect(204, send("PATCH", linkPath + "/" + link, owner, "{\"permission\":\"EDITOR\"}"));
        expect(401, send("GET", shared, null, null));
        expect(200, send("PUT", shared + "/content", member, snapshot(1)));
        expect(404, send("GET", path(page) + "/content", member, null));
        assertTrue(json(send("GET", "/pages/search?q=nebulosa", member, null)).isEmpty());
        String otherPage = create(owner, "Outra página", null);
        assertEquals(1, json(send("GET", path(otherPage) + "/content", owner, null)).get("version").asLong());

        jdbc.update("UPDATE page_share_links SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 minute' WHERE id = ?",
                UUID.fromString(link));
        expect(410, send("GET", shared, member, null));
        JsonNode next = json(expect(201, send("POST", linkPath, owner, "{\"permission\":\"VIEWER\"}")));
        expect(410, send("PUT", shared + "/content", member, snapshot(2)));
        String nextToken = next.get("token").asText();
        expect(200, send("GET", "/shared/" + nextToken, null, null));
        expect(204, send("DELETE", linkPath + "/" + id(next.get("link")), owner, null));
        expect(410, send("GET", "/shared/" + nextToken, null, null));
    }

    @Test
    void filtersPersonalCategoriesAndRanksTitleMatchesBeforeContent() throws Exception {
        String category = jdbc.queryForObject("""
                INSERT INTO categories (owner_user_id, name) VALUES (?, ?) RETURNING id
                """, UUID.class, owner.id(), "Ciência-" + UUID.randomUUID()).toString();
        String titled = create(owner, "Nebulosa", category);
        expect(200, send("PUT", path(page) + "/content", owner, snapshot(1)));
        expect(204, send("PUT", path(titled) + "/favorite", owner, null));
        assertEquals(titled, id(json(send("GET", "/pages?categoryId=" + category, owner, null)).get(0)));
        expect(404, send("GET", "/pages?categoryId=" + category, member, null));
        expect(404, send("GET", "/pages?categoryId=" + UUID.randomUUID(), owner, null));
        expect(400, send("GET", "/pages?categoryId=" + category + "&uncategorized=true", owner, null));
        assertEquals(page, id(json(send("GET", "/pages?uncategorized=true", owner, null)).get(0)));
        assertEquals(1, json(send("GET", "/pages?size=1&page=1", owner, null)).size());
        assertTrue(json(send("GET", "/pages?size=1&page=2", owner, null)).isEmpty());
        assertEquals(titled, id(json(send("GET", "/pages/search?q=nebulosa", owner, null)).get(0)));
        JsonNode filtered = json(send("GET", "/pages/search?q=nebulosa&favoritesOnly=true&categoryId=" + category, owner, null));
        assertEquals(1, filtered.size());
        assertEquals(titled, id(filtered.get(0)));
        expect(204, send("DELETE", path(titled), owner, null));
        assertTrue(json(send("GET", "/pages?categoryId=" + category, owner, null)).isEmpty());
    }

    @Test
    void doesNotInheritPermissionsAndSerializesConcurrentRevocation() throws Exception {
        String child = id(json(expect(201, send("POST", "/pages", owner,
                "{\"title\":\"Filha\",\"parentId\":\"" + page + "\"}"))));
        expect(400, send("PATCH", path(page) + "/parent", owner, "{\"parentId\":\"" + child + "\"}"));
        expect(201, send("POST", path(page) + "/permissions", owner, invite(member.email(), "EDITOR")));
        expect(404, send("GET", path(child) + "/content", member, null));
        expect(403, send("PATCH", path(page) + "/parent", member, "{\"parentId\":null}"));
        JsonNode created = json(expect(201, send("POST", path(page) + "/share-links", owner, "{\"permission\":\"EDITOR\"}")));
        String content = "/shared/" + created.get("token").asText() + "/content";
        var write = http.sendAsync(request("PUT", content, member, snapshot(1)), HttpResponse.BodyHandlers.ofString());
        expect(204, send("DELETE", path(page) + "/share-links/" + id(created.get("link")), owner, null));
        assertTrue(List.of(200, 410).contains(write.get().statusCode()));
        expect(410, send("PUT", content, member, snapshot(2)));
    }

    private Account account() {
        String email = UUID.randomUUID() + "@example.test";
        UUID id = jdbc.queryForObject("INSERT INTO users (email, password_hash) VALUES (?, '') RETURNING id", UUID.class, email);
        return new Account(id, email, jwt.generateToken(email));
    }

    private String create(Account account, String title, String category) throws Exception {
        return id(json(expect(201, send("POST", "/pages", account,
                "{\"title\":\"" + title + "\",\"categoryId\":" + (category == null ? "null" : "\"" + category + "\"") + "}"))));
    }

    private String invite(String email, String permission) {
        return "{\"email\":\"" + email + "\",\"permission\":\"" + permission + "\"}";
    }

    private String snapshot(int version) {
        return "{\"version\":" + version + ",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"nebulosa\"}]}]}";
    }

    private String path(String id) { return "/pages/" + id; }
    private String id(JsonNode node) { return node.get("id").asText(); }
    private JsonNode json(HttpResponse<String> response) { return json.readTree(response.body()); }

    private HttpResponse<String> expect(int status, HttpResponse<String> response) {
        assertEquals(status, response.statusCode(), response.body());
        return response;
    }

    private HttpResponse<String> send(String method, String path, Account actor, String payload) throws Exception {
        return http.send(request(method, path, actor, payload), HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest request(String method, String path, Account actor, String payload) {
        var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api" + path))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json");
        if (actor != null) builder.header("Authorization", "Bearer " + actor.token());
        return builder.method(method, payload == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(payload)).build();
    }
}
