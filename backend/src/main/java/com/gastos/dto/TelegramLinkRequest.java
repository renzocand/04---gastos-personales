package com.gastos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request del bot de Telegram para vincular una cuenta.
 */
public record TelegramLinkRequest(
        @NotBlank(message = "El código es requerido")
        @Size(min = 6, max = 6, message = "El código debe tener 6 caracteres")
        String code,

        @NotNull(message = "El telegramId es requerido")
        Long telegramId,

        String telegramUsername,

        String telegramName
) {
}
