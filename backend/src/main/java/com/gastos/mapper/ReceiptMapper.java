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
     * Currency se deriva del primer expense o default PEN.
     */
    public ReceiptResponse toResponse(Receipt receipt, int itemCount, String currency) {
        return new ReceiptResponse(
                receipt.getId(),
                receipt.getVendor(),
                receipt.getDate(),
                receipt.getTotal(),
                currency != null ? currency : "PEN",
                receipt.getSource() != null ? receipt.getSource().name() : null,
                receipt.getImageUrl(),
                itemCount,
                receipt.getCreatedAt()
        );
    }

    /**
     * Entidad Receipt a DTO de respuesta detallada con lista de gastos.
     * Currency se deriva del primer item o default PEN.
     */
    public ReceiptWithItemsResponse toResponseWithItems(Receipt receipt, List<ExpenseResponse> items) {
        String currency = items.isEmpty() ? "PEN" : items.get(0).currency().name();
        return new ReceiptWithItemsResponse(
                receipt.getId(),
                receipt.getVendor(),
                receipt.getDate(),
                receipt.getTotal(),
                currency,
                receipt.getSource() != null ? receipt.getSource().name() : null,
                receipt.getImageUrl(),
                items.size(),
                receipt.getCreatedAt(),
                items
        );
    }
}
