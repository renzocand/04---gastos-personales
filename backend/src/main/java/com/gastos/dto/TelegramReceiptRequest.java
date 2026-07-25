package com.gastos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request para crear un recibo con sus gastos desde el bot de Telegram.
 */
public record TelegramReceiptRequest(
        @NotNull Long telegramId,
        String vendor,
        @NotNull LocalDate date,
        BigDecimal total,
        @Valid @NotNull List<Item> items
) {
    /**
     * Item de la boleta: cada linea se convierte en un gasto.
     */
    public record Item(
            @NotNull String description,
            @NotNull BigDecimal amount,
            @NotNull String categoryId
    ) {}
}
