package com.folio.backend.presentation.controller;

import com.folio.backend.infrastructure.repository.UserPreferenceRepository;
import com.folio.backend.infrastructure.security.AuthenticatedUser;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/me/preferences/theme")
public class UserPreferenceController {
    private static final Set<String> THEMES = Set.of("system", "light", "dark");
    private final UserPreferenceRepository preferences;

    public UserPreferenceController(UserPreferenceRepository preferences) {
        this.preferences = preferences;
    }

    public record Theme(String theme) {}

    @GetMapping
    public ResponseEntity<Theme> theme(@AuthenticationPrincipal AuthenticatedUser user) {
        String saved = preferences.theme(user.id());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(new Theme(THEMES.contains(saved) ? saved : "system"));
    }

    @PutMapping
    public ResponseEntity<Void> saveTheme(@AuthenticationPrincipal AuthenticatedUser user, @RequestBody Theme input) {
        if (input.theme() == null || !THEMES.contains(input.theme())) {
            return ResponseEntity.badRequest().build();
        }
        preferences.saveTheme(user.id(), input.theme());
        return ResponseEntity.noContent().build();
    }
}
