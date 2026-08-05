package com.gastos.service;

import com.gastos.dto.ExpenseResponse;
import com.gastos.dto.ReceiptResponse;
import com.gastos.dto.ReceiptUpdateRequest;
import com.gastos.dto.ReceiptWithItemsResponse;
import com.gastos.dto.TelegramReceiptRequest;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.mapper.ExpenseMapper;
import com.gastos.mapper.ReceiptMapper;
import com.gastos.model.Currency;
import com.gastos.model.Expense;
import com.gastos.model.Receipt;
import com.gastos.model.ReceiptSource;
import com.gastos.model.TelegramLink;
import com.gastos.model.User;
import com.gastos.model.UserCategory;
import com.gastos.repository.ExpenseRepository;
import com.gastos.repository.ReceiptRepository;
import com.gastos.repository.TelegramLinkRepository;
import com.gastos.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Logica de negocio para recibos/boletas. Maneja la creacion de recibos
 * con sus gastos asociados, deteccion de duplicados y eliminacion en cascada.
 */
@Service
@Transactional(readOnly = true)
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ExpenseRepository expenseRepository;
    private final UserCategoryService userCategoryService;
    private final UserRepository userRepository;
    private final TelegramLinkRepository telegramLinkRepository;
    private final ReceiptMapper receiptMapper;
    private final ExpenseMapper expenseMapper;
    private final Messages messages;

    public ReceiptService(ReceiptRepository receiptRepository,
                          ExpenseRepository expenseRepository,
                          UserCategoryService userCategoryService,
                          UserRepository userRepository,
                          TelegramLinkRepository telegramLinkRepository,
                          ReceiptMapper receiptMapper,
                          ExpenseMapper expenseMapper,
                          Messages messages) {
        this.receiptRepository = receiptRepository;
        this.expenseRepository = expenseRepository;
        this.userCategoryService = userCategoryService;
        this.userRepository = userRepository;
        this.telegramLinkRepository = telegramLinkRepository;
        this.receiptMapper = receiptMapper;
        this.expenseMapper = expenseMapper;
        this.messages = messages;
    }

    /**
     * Lista todos los recibos del usuario ordenados por fecha descendente.
     */
    public List<ReceiptResponse> findByUser(String dni) {
        return receiptRepository.findByUserDniOrderByDateDesc(dni).stream()
                .map(receipt -> {
                    String currency = expenseRepository.findFirstByReceiptId(receipt.getId())
                            .map(e -> e.getCurrency().name())
                            .orElse("PEN");
                    return receiptMapper.toResponse(
                            receipt,
                            expenseRepository.countByReceiptId(receipt.getId()),
                            currency
                    );
                })
                .toList();
    }

    /**
     * Obtiene un recibo por id con todos sus gastos asociados.
     */
    public ReceiptWithItemsResponse findById(String dni, String receiptId) {
        Receipt receipt = requireOwnedReceipt(dni, receiptId);
        List<ExpenseResponse> items = expenseRepository.findByReceiptId(receiptId).stream()
                .map(expenseMapper::toResponse)
                .toList();
        return receiptMapper.toResponseWithItems(receipt, items);
    }

    /**
     * Crea un recibo con sus gastos desde el bot de Telegram.
     * Cada item se convierte en un gasto individual asociado al recibo.
     */
    @Transactional
    public ReceiptWithItemsResponse createFromTelegram(TelegramReceiptRequest request) {
        TelegramLink link = telegramLinkRepository.findByTelegramId(request.telegramId())
                .orElseThrow(() -> new NotFoundException("Telegram no vinculado"));

        User user = link.getUser();
        String vendor = request.vendor() != null ? request.vendor() : "";

        // Determinar moneda (default PEN si no se especifica)
        Currency currency = Currency.PEN;
        if (request.currency() != null) {
            try {
                currency = Currency.valueOf(request.currency().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Si no es válida, usar PEN por defecto
                currency = Currency.PEN;
            }
        }

        // Crear el recibo
        Receipt receipt = new Receipt();
        receipt.setVendor(vendor);
        receipt.setDate(request.date());
        receipt.setTotal(request.total());
        receipt.setSource(ReceiptSource.TELEGRAM);
        receipt.setUser(user);
        receipt = receiptRepository.save(receipt);

        // Crear los gastos asociados
        final Receipt savedReceipt = receipt;
        final Currency expenseCurrency = currency;
        List<Expense> expenses = request.items().stream()
                .map(item -> {
                    UserCategory category = requireCategory(user.getId(), item.categoryId());
                    String description = vendor.isEmpty()
                            ? item.description()
                            : item.description() + " (" + vendor + ")";

                    Expense expense = new Expense();
                    expense.setAmount(item.amount());
                    expense.setCurrency(expenseCurrency);
                    expense.setDescription(description);
                    expense.setCategory(category);
                    expense.setUser(user);
                    expense.setDate(request.date());
                    expense.setReceipt(savedReceipt);
                    return expense;
                })
                .toList();

        List<Expense> savedExpenses = expenseRepository.saveAll(expenses);
        List<ExpenseResponse> items = savedExpenses.stream()
                .map(expenseMapper::toResponse)
                .toList();

        return receiptMapper.toResponseWithItems(savedReceipt, items);
    }

    /**
     * Detecta si ya existe un recibo con los mismos datos (duplicado).
     * Util para prevenir registros duplicados al escanear boletas.
     */
    public boolean isDuplicate(String dni, String vendor, LocalDate date, BigDecimal total) {
        return receiptRepository.findByUserDniAndVendorAndDateAndTotal(dni, vendor, date, total)
                .isPresent();
    }

    /**
     * Actualiza un recibo y todos sus gastos asociados (cascada).
     * Al cambiar la fecha del recibo, se actualiza la fecha de todos sus gastos.
     */
    @Transactional
    public ReceiptWithItemsResponse update(String dni, String receiptId, ReceiptUpdateRequest request) {
        Receipt receipt = requireOwnedReceipt(dni, receiptId);

        // Actualizar campos del recibo
        receipt.setDate(request.date());
        if (request.vendor() != null) {
            receipt.setVendor(request.vendor());
        }
        receiptRepository.save(receipt);

        // Actualizar fecha de todos los gastos asociados (cascada)
        List<Expense> expenses = expenseRepository.findByReceiptId(receiptId);
        for (Expense expense : expenses) {
            expense.setDate(request.date());
        }
        expenseRepository.saveAll(expenses);

        // Retornar el recibo actualizado con sus items
        List<ExpenseResponse> items = expenses.stream()
                .map(expenseMapper::toResponse)
                .toList();
        return receiptMapper.toResponseWithItems(receipt, items);
    }

    /**
     * Elimina un recibo y todos sus gastos asociados.
     */
    @Transactional
    public void delete(String dni, String receiptId) {
        Receipt receipt = requireOwnedReceipt(dni, receiptId);
        // Eliminar primero los gastos asociados
        expenseRepository.deleteByReceiptId(receiptId);
        // Luego eliminar el recibo
        receiptRepository.delete(receipt);
    }

    /**
     * Recupera un recibo solo si pertenece al usuario; si no, 404.
     */
    private Receipt requireOwnedReceipt(String dni, String receiptId) {
        return receiptRepository.findByIdAndUserDni(receiptId, dni)
                .orElseThrow(() -> new NotFoundException(messages.get("error.receiptNotFound", receiptId)));
    }

    private UserCategory requireCategory(String userId, String categoryId) {
        return userCategoryService.requireOwnedCategory(userId, categoryId);
    }
}
