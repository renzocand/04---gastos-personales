package com.gastos.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Request para actualizar un recibo.
 * Al cambiar la fecha, se actualizan todos los gastos asociados en cascada.
 */
public record ReceiptUpdateRequest(
        @NotNull LocalDate date,
        String vendor
) {
}
