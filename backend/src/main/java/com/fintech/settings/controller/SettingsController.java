package com.fintech.settings.controller;

import com.fintech.settings.entity.SystemSetting;
import com.fintech.settings.service.AuditService;
import com.fintech.settings.service.SettingsService;
import com.fintech.user.entity.User;
import com.fintech.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;
    private final AuditService auditService;
    private final UserService userService;

    @GetMapping("/public/brand")
    public ResponseEntity<List<SystemSetting>> getBrandSettings() {
        return ResponseEntity.ok(settingsService.getSettingsByCategory(SystemSetting.SettingCategory.BRAND));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SystemSetting>> getSettingsByCategory(@PathVariable SystemSetting.SettingCategory category) {
        return ResponseEntity.ok(settingsService.getSettingsByCategory(category));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateSettings(@RequestBody List<SystemSetting> settings, Authentication authentication) {
        settingsService.updateMultipleSettings(settings);
        
        if (authentication != null) {
            User admin = userService.findByEmail(authentication.getName());
            auditService.logAction(
                    admin.getId(),
                    admin.getFullName(),
                    "UPDATE_SETTINGS",
                    "SystemSetting",
                    null,
                    "Updated " + settings.size() + " settings",
                    "127.0.0.1" // In a real app, get from request
            );
        }
        
        return ResponseEntity.ok().build();
    }
}
