package com.gastos.mapper;

import com.gastos.dto.ExpenseResponse;
import com.gastos.dto.ReceiptResponse;
import com.gastos.dto.ReceiptWithItemsResponse;
import com.gastos.model.Receipt;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Conversiones entre entidad Receipt y DTOs.
 */
@Component
public class ReceiptMapper {

    private final ExpenseMapper expenseMapper;

    public ReceiptMapper(ExpenseMapper expenseMapper) {
        this.expenseMapper = expenseMapper;
    }

    /**
     * Entidad Receipt a DTO de respuesta con conteo de items.
     */
    public ReceiptResponse toResponse(Receipt receipt, int itemCount) {
        return new ReceiptResponse(
                receipt.getId(),
                receipt.getVendor(),
                receipt.getDate(),
                receipt.getTotal(),
                receipt.getSource() != null ? receipt.getSource().name() : null,
                receipt.getImageUrl(),
                itemCount,
                receipt.getCreatedAt()
        );
    }

    /**
     * Entidad Receipt a DTO de respuesta detallada con lista de gastos.
     */
    public ReceiptWithItemsResponse toResponseWithItems(Receipt receipt, List<ExpenseResponse> items) {
        return new ReceiptWithItemsResponse(
                receipt.getId(),
                receipt.getVendor(),
                receipt.getDate(),
                receipt.getTotal(),
                receipt.getSource() != null ? receipt.getSource().name() : null,
                receipt.getImageUrl(),
                items.size(),
                receipt.getCreatedAt(),
                items
        );
    }
}
