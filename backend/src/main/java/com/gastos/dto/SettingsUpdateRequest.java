package com.gastos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Cuerpo para actualizar la configuración del usuario (PUT /api/settings).
 * monthlyIncome es opcional (null = sin configurar / borrar el valor).
 */
public record SettingsUpdateRequest(

        @PositiveOrZero(message = "El ingreso no puede ser negativo")
        @Digits(integer = 10, fraction = 2, message = "El ingreso tiene un formato inválido")
        BigDecimal monthlyIncome,

        boolean alertsEnabled
) {
}
