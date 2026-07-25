package com.gastos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request para crear gastos desde el bot de Telegram.
 */
public record TelegramExpenseRequest(
        @NotNull Long telegramId,
        @NotNull LocalDate date,
        String vendor,
        @Valid List<TelegramExpenseItem> items
) {
    public record TelegramExpenseItem(
            @NotNull String description,
            @NotNull BigDecimal amount,
            @NotNull String categoryId
    ) {}
}
