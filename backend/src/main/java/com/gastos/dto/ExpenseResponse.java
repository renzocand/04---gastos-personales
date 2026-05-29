package com.gastos.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.gastos.model.Currency;

/**
 * Respuesta de un gasto. Los campos id/currency/amount/description/categoryId/date
 * coinciden exactamente con la interface Expense del frontend; createdAt/updatedAt
 * son auditoría extra que el front ignora.
 */
public record ExpenseResponse(
        String id,
        Currency currency,
        BigDecimal amount,
        String description,
        String categoryId,
        LocalDate date,
        Instant createdAt,
        Instant updatedAt
) {
}
