package com.gastos.dto;

import java.math.BigDecimal;

/**
 * Tipo de cambio USD → PEN (GET /api/exchange-rate).
 */
public record ExchangeRateResponse(
        BigDecimal rate
) {
}
