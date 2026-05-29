package com.gastos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.gastos.model.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo para crear un gasto (POST /api/expenses).
 * Espeja el payload Omit&lt;Expense, 'id'&gt; del frontend.
 */
public record ExpenseRequest(

        @NotNull
        @DecimalMin(value = "0.1", message = "El monto debe ser mayor a 0.1")
        BigDecimal amount,

        @NotNull(message = "La moneda es obligatoria")
        Currency currency,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 80, message = "La descripción no puede superar 80 caracteres")
        String description,

        @NotBlank(message = "La categoría es obligatoria")
        String categoryId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate date
) {
}
