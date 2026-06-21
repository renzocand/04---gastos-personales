package com.gastos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Cuerpo para actualizar la configuración del usuario (PUT /api/settings).
 * monthlyIncome es opcional (null = sin configurar / borrar el valor).
 */
public record SettingsUpdateRequest(

        @PositiveOrZero(message = "{settings.income.negative}")
        @Digits(integer = 10, fraction = 2, message = "{settings.income.digits}")
        BigDecimal monthlyIncome,

        boolean alertsEnabled,

        // ===== Preferencias de accesibilidad =====

        boolean highContrast,

        @Pattern(regexp = "normal|large|xlarge", message = "{settings.fontScale.invalid}")
        String fontScale,

        boolean reduceMotion
) {
}
