package com.gastos.controller;

import com.gastos.dto.*;
import com.gastos.service.ReceiptService;
import com.gastos.service.TelegramService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Endpoints para vinculación de Telegram.
 */
@RestController
@RequestMapping("/api/telegram")
public class TelegramController {

    private final TelegramService telegramService;
    private final ReceiptService receiptService;

    public TelegramController(TelegramService telegramService, ReceiptService receiptService) {
        this.telegramService = telegramService;
        this.receiptService = receiptService;
    }

    /**
     * Respuesta para verificación de duplicados.
     */
    public record DuplicateCheckResponse(boolean isDuplicate, String existingReceiptId) {}

    /**
     * Genera un código de vinculación para el usuario autenticado.
     * GET /api/telegram/generate-code
     */
    @GetMapping("/generate-code")
    public ResponseEntity<TelegramLinkCodeResponse> generateCode(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(telegramService.generateCode(user.getUsername()));
    }

    /**
     * Valida un código y vincula el Telegram con la cuenta.
     * Llamado por el bot de Telegram (sin autenticación JWT).
     * POST /api/telegram/link
     */
    @PostMapping("/link")
    public ResponseEntity<TelegramUserResponse> linkTelegram(
            @Valid @RequestBody TelegramLinkRequest request) {
        return ResponseEntity.ok(telegramService.linkTelegram(request));
    }

    /**
     * Obtiene el usuario vinculado a un Telegram ID.
     * Usado por el bot para identificar usuarios.
     * GET /api/telegram/user/{telegramId}
     */
    @GetMapping("/user/{telegramId}")
    public ResponseEntity<TelegramUserResponse> getUserByTelegramId(
            @PathVariable Long telegramId) {
        return ResponseEntity.ok(telegramService.getUserByTelegramId(telegramId));
    }

    /**
     * Lista las vinculaciones del usuario autenticado.
     * GET /api/telegram/my-links
     */
    @GetMapping("/my-links")
    public ResponseEntity<List<TelegramLinkResponse>> getMyLinks(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(telegramService.getMyLinks(user.getUsername()));
    }

    /**
     * Desvincula un Telegram del usuario autenticado.
     * DELETE /api/telegram/unlink/{linkId}
     */
    @DeleteMapping("/unlink/{linkId}")
    public ResponseEntity<Void> unlink(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String linkId) {
        telegramService.unlink(user.getUsername(), linkId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Desvincula por Telegram ID (usado por el bot con /desvincular).
     * DELETE /api/telegram/unlink-by-telegram/{telegramId}
     */
    @DeleteMapping("/unlink-by-telegram/{telegramId}")
    public ResponseEntity<Void> unlinkByTelegramId(@PathVariable Long telegramId) {
        telegramService.unlinkByTelegramId(telegramId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Crea un recibo con sus gastos desde el bot de Telegram.
     * POST /api/telegram/expenses
     */
    @PostMapping("/expenses")
    public ResponseEntity<ReceiptWithItemsResponse> createReceipt(
            @Valid @RequestBody TelegramReceiptRequest request) {
        return ResponseEntity.ok(telegramService.createReceiptFromTelegram(request));
    }

    /**
     * Verifica si ya existe un recibo con los mismos datos (duplicado).
     * GET /api/telegram/check-duplicate
     */
    @GetMapping("/check-duplicate")
    public ResponseEntity<DuplicateCheckResponse> checkDuplicate(
            @RequestParam Long telegramId,
            @RequestParam String vendor,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam BigDecimal total) {
        // Obtener el DNI del usuario vinculado
        TelegramUserResponse user = telegramService.getUserByTelegramId(telegramId);
        boolean isDuplicate = receiptService.isDuplicate(user.dni(), vendor, date, total);
        // Por ahora no retornamos el ID del recibo existente (requeriria otro metodo)
        return ResponseEntity.ok(new DuplicateCheckResponse(isDuplicate, null));
    }
}
