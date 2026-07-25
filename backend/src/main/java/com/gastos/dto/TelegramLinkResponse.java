package com.gastos.dto;

import java.time.Instant;

/**
 * Información de una vinculación de Telegram.
 */
public record TelegramLinkResponse(
        String id,
        Long telegramId,
        String telegramUsername,
        String telegramName,
        Instant linkedAt
) {
}
