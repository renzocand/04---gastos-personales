package com.gastos.controller;

import com.gastos.dto.SettingsResponse;
import com.gastos.dto.SettingsUpdateRequest;
import com.gastos.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Configuración del usuario autenticado. Protegido por JWT (el dni sale del
 * token vía Authentication.getName(), igual que en ExpenseController).
 */
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    /** GET /api/settings → configuración del usuario (o defaults si no tiene). */
    @GetMapping
    public SettingsResponse get(Authentication authentication) {
        return settingsService.get(authentication.getName());
    }

    /** PUT /api/settings → crea o actualiza la configuración del usuario. */
    @PutMapping
    public SettingsResponse update(Authentication authentication,
                                   @Valid @RequestBody SettingsUpdateRequest request) {
        return settingsService.update(authentication.getName(), request);
    }
}
