package com.gastos.dto;

import java.time.Instant;

/**
 * Respuesta al generar un código de vinculación.
 */
public record TelegramLinkCodeResponse(
        String code,
        Instant expiresAt,
        long expiresInSeconds
) {
}
