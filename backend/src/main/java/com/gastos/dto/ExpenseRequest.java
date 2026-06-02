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

        @NotNull(message = "{expense.amount.required}")
        @DecimalMin(value = "0.1", message = "{expense.amount.min}")
        BigDecimal amount,

        @NotNull(message = "{expense.currency.required}")
        Currency currency,

        @NotBlank(message = "{expense.description.required}")
        @Size(max = 80, message = "{expense.description.size}")
        String description,

        @NotBlank(message = "{expense.category.required}")
        String categoryId,

        @NotNull(message = "{expense.date.required}")
        LocalDate date
) {
}
