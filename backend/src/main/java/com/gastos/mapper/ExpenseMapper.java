package com.gastos.mapper;

import com.gastos.dto.CategoryResponse;
import com.gastos.dto.ExpenseRequest;
import com.gastos.dto.ExpenseResponse;
import com.gastos.model.Category;
import com.gastos.model.Expense;
import org.springframework.stereotype.Component;

/**
 * Conversiones entre entidades y DTOs. Mantiene los controllers/services
 * libres de mapeo manual repetido.
 */
@Component
public class ExpenseMapper {

    /** Entidad Expense → DTO de respuesta (aplana categoryId). */
    public ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getCurrency(),
                e.getAmount(),
                e.getDescription(),
                e.getCategory().getId(),
                e.getDate(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    /** Request de creación + categoría ya resuelta → nueva entidad Expense. */
    public Expense toEntity(ExpenseRequest req, Category category) {
        Expense e = new Expense();
        e.setAmount(req.amount());
        e.setCurrency(req.currency());
        e.setDescription(req.description());
        e.setCategory(category);
        e.setDate(req.date());
        return e;
    }

    /** Entidad Category → DTO de respuesta. */
    public CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getIcon());
    }
}
