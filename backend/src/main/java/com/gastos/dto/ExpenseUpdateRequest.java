package com.gastos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.gastos.model.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo para actualizar parcialmente un gasto (PATCH /api/expenses/{id}).
 * Todos los campos son opcionales: solo se aplican los no-null. Espeja el
 * Partial&lt;Omit&lt;Expense, 'id'&gt;&gt; del frontend. Las validaciones se ignoran
 * cuando el campo llega null (semántica de Bean Validation).
 */
public record ExpenseUpdateRequest(

        @DecimalMin(value = "0.1", message = "El monto debe ser mayor a 0.1")
        BigDecimal amount,

        Currency currency,

        @Size(max = 80, message = "La descripción no puede superar 80 caracteres")
        String description,

        String categoryId,

        LocalDate date
) {
}
