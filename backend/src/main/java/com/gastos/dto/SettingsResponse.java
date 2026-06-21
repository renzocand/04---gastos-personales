package com.gastos.dto;

import java.math.BigDecimal;

/**
 * Configuración del usuario autenticado (GET /api/settings).
 * monthlyIncome puede ser null si todavía no lo configuró.
 */
public record SettingsResponse(
        BigDecimal monthlyIncome,
        boolean alertsEnabled,
        boolean highContrast,
        String fontScale,
        boolean reduceMotion
) {
}
