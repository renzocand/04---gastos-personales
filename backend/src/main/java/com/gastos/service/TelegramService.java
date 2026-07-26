package com.gastos.service;

import com.gastos.dto.*;
import com.gastos.exception.BadRequestException;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.model.TelegramLink;
import com.gastos.model.TelegramLinkCode;
import com.gastos.model.User;
import com.gastos.repository.TelegramLinkCodeRepository;
import com.gastos.repository.TelegramLinkRepository;
import com.gastos.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Servicio para manejar vinculaciones de Telegram.
 */
@Service
@Transactional(readOnly = true)
public class TelegramService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin I, O, 0, 1 para evitar confusión
    private static final int CODE_LENGTH = 6;
    private static final Duration CODE_VALIDITY = Duration.ofMinutes(5);

    private final TelegramLinkRepository linkRepository;
    private final TelegramLinkCodeRepository codeRepository;
    private final UserRepository userRepository;
    private final ReceiptService receiptService;
    private final Messages messages;
    private final SecureRandom random = new SecureRandom();

    public TelegramService(TelegramLinkRepository linkRepository,
                           TelegramLinkCodeRepository codeRepository,
                           UserRepository userRepository,
                           @Lazy ReceiptService receiptService,
                           Messages messages) {
        this.linkRepository = linkRepository;
        this.codeRepository = codeRepository;
        this.userRepository = userRepository;
        this.receiptService = receiptService;
        this.messages = messages;
    }

    /**
     * Genera un código de vinculación para el usuario autenticado.
     * Si ya tiene uno activo, lo reemplaza.
     */
    @Transactional
    public TelegramLinkCodeResponse generateCode(String dni) {
        User user = requireUser(dni);

        // Eliminar código anterior si existe
        codeRepository.deleteByUserDni(dni);

        // Generar nuevo código único
        String code = generateUniqueCode();
        Instant expiresAt = Instant.now().plus(CODE_VALIDITY);

        TelegramLinkCode linkCode = new TelegramLinkCode(code, user, expiresAt);
        codeRepository.save(linkCode);

        return new TelegramLinkCodeResponse(
                code,
                expiresAt,
                CODE_VALIDITY.toSeconds()
        );
    }

    /**
     * Valida un código y vincula el Telegram con la cuenta.
     * Llamado por el bot de Telegram.
     */
    @Transactional
    public TelegramUserResponse linkTelegram(TelegramLinkRequest request) {
        // Verificar si ya está vinculado
        if (linkRepository.existsByTelegramId(request.telegramId())) {
            throw new BadRequestException("Este Telegram ya está vinculado a una cuenta");
        }

        // Buscar y validar código
        TelegramLinkCode linkCode = codeRepository.findByCode(request.code().toUpperCase())
                .orElseThrow(() -> new NotFoundException("Código inválido o expirado"));

        if (linkCode.isExpired()) {
            codeRepository.delete(linkCode);
            throw new BadRequestException("El código ha expirado. Genera uno nuevo.");
        }

        // Crear vinculación
        User user = linkCode.getUser();
        TelegramLink link = new TelegramLink(
                request.telegramId(),
                user,
                request.telegramUsername(),
                request.telegramName()
        );
        linkRepository.save(link);

        // Eliminar código usado
        codeRepository.delete(linkCode);

        return new TelegramUserResponse(
                user.getId(),
                user.getDni(),
                user.getFirstName(),
                user.getLastName(),
                true
        );
    }

    /**
     * Obtiene el usuario vinculado a un Telegram ID.
     * Usado por el bot para identificar usuarios.
     */
    public TelegramUserResponse getUserByTelegramId(Long telegramId) {
        TelegramLink link = linkRepository.findByTelegramId(telegramId)
                .orElseThrow(() -> new NotFoundException("Telegram no vinculado"));

        User user = link.getUser();
        return new TelegramUserResponse(
                user.getId(),
                user.getDni(),
                user.getFirstName(),
                user.getLastName(),
                true
        );
    }

    /**
     * Lista las vinculaciones del usuario autenticado.
     */
    public List<TelegramLinkResponse> getMyLinks(String dni) {
        return linkRepository.findByUserDni(dni).stream()
                .map(link -> new TelegramLinkResponse(
                        link.getId(),
                        link.getTelegramId(),
                        link.getTelegramUsername(),
                        link.getTelegramName(),
                        link.getLinkedAt()
                ))
                .toList();
    }

    /**
     * Desvincula un Telegram del usuario autenticado.
     */
    @Transactional
    public void unlink(String dni, String linkId) {
        TelegramLink link = linkRepository.findById(linkId)
                .orElseThrow(() -> new NotFoundException("Vinculación no encontrada"));

        if (!link.getUser().getDni().equals(dni)) {
            throw new BadRequestException("No puedes desvincular este Telegram");
        }

        linkRepository.delete(link);
    }

    /**
     * Desvincula por Telegram ID (usado por el bot con /desvincular).
     */
    @Transactional
    public void unlinkByTelegramId(Long telegramId) {
        TelegramLink link = linkRepository.findByTelegramId(telegramId)
                .orElseThrow(() -> new NotFoundException("Telegram no vinculado"));
        linkRepository.delete(link);
    }

    /**
     * Crea un recibo con sus gastos desde el bot de Telegram.
     * Delega la creacion al ReceiptService.
     */
    @Transactional
    public ReceiptWithItemsResponse createReceiptFromTelegram(TelegramReceiptRequest request) {
        return receiptService.createFromTelegram(request);
    }

    /**
     * Crea gastos desde el bot de Telegram (mantiene compatibilidad).
     * Internamente crea un recibo y retorna solo los gastos.
     * @deprecated Usar createReceiptFromTelegram para obtener tambien el recibo.
     */
    @Deprecated
    @Transactional
    public List<ExpenseResponse> createExpensesFromTelegram(TelegramExpenseRequest request) {
        // Convertir TelegramExpenseRequest a TelegramReceiptRequest
        List<TelegramReceiptRequest.Item> items = request.items().stream()
                .map(item -> new TelegramReceiptRequest.Item(
                        item.description(),
                        item.amount(),
                        item.categoryId()
                ))
                .toList();

        TelegramReceiptRequest receiptRequest = new TelegramReceiptRequest(
                request.telegramId(),
                request.vendor(),
                request.date(),
                null, // total no disponible en el request antiguo
                null, // currency default PEN
                items
        );

        ReceiptWithItemsResponse receipt = receiptService.createFromTelegram(receiptRequest);
        return receipt.items();
    }

    /**
     * Limpia códigos expirados cada minuto.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredCodes() {
        codeRepository.deleteExpired(Instant.now());
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = generateRandomCode();
        } while (codeRepository.findByCode(code).isPresent());
        return code;
    }

    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private User requireUser(String dni) {
        return userRepository.findByDni(dni)
                .orElseThrow(() -> new NotFoundException(messages.get("error.userNotFound", dni)));
    }
}
