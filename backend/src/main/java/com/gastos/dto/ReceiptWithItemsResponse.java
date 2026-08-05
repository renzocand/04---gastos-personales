package com.gastos.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Respuesta detallada de un recibo incluyendo todos sus gastos asociados.
 */
public record ReceiptWithItemsResponse(
        String id,
        String vendor,
        LocalDate date,
        BigDecimal total,
        String currency,
        String source,
        String imageUrl,
        int itemCount,
        Instant createdAt,
        List<ExpenseResponse> items
) {
}
