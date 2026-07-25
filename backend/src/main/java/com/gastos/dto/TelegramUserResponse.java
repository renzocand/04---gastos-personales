package com.gastos.dto;

/**
 * Info del usuario para el bot de Telegram.
 */
public record TelegramUserResponse(
        String userId,
        String dni,
        String firstName,
        String lastName,
        boolean linked
) {
}
