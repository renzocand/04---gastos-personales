package com.gastos.controller;

import java.util.List;

import com.gastos.dto.ReceiptResponse;
import com.gastos.dto.ReceiptWithItemsResponse;
import com.gastos.service.ReceiptService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints para gestionar recibos/boletas del usuario autenticado.
 */
@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    /**
     * Lista todos los recibos del usuario ordenados por fecha descendente.
     * GET /api/receipts
     */
    @GetMapping
    public List<ReceiptResponse> list(Authentication authentication) {
        return receiptService.findByUser(authentication.getName());
    }

    /**
     * Obtiene un recibo con todos sus gastos asociados.
     * GET /api/receipts/{id}
     */
    @GetMapping("/{id}")
    public ReceiptWithItemsResponse getById(Authentication authentication, @PathVariable String id) {
        return receiptService.findById(authentication.getName(), id);
    }

    /**
     * Elimina un recibo y todos sus gastos asociados.
     * DELETE /api/receipts/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication, @PathVariable String id) {
        receiptService.delete(authentication.getName(), id);
    }
}
