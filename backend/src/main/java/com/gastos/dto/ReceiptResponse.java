package com.gastos.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Respuesta de un recibo/boleta. Incluye el conteo de gastos asociados.
 */
public record ReceiptResponse(
        String id,
        String vendor,
        LocalDate date,
        BigDecimal total,
        String source,
        String imageUrl,
        int itemCount,
        Instant createdAt
) {
}
