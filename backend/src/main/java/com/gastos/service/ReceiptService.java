package com.gastos.service;

import com.gastos.dto.ExpenseResponse;
import com.gastos.dto.ReceiptResponse;
import com.gastos.dto.ReceiptWithItemsResponse;
import com.gastos.dto.TelegramReceiptRequest;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.mapper.ExpenseMapper;
import com.gastos.mapper.ReceiptMapper;
import com.gastos.model.Category;
import com.gastos.model.Currency;
import com.gastos.model.Expense;
import com.gastos.model.Receipt;
import com.gastos.model.ReceiptSource;
import com.gastos.model.TelegramLink;
import com.gastos.model.User;
import com.gastos.repository.CategoryRepository;
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
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TelegramLinkRepository telegramLinkRepository;
    private final ReceiptMapper receiptMapper;
    private final ExpenseMapper expenseMapper;
    private final Messages messages;

    public ReceiptService(ReceiptRepository receiptRepository,
                          ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository,
                          TelegramLinkRepository telegramLinkRepository,
                          ReceiptMapper receiptMapper,
                          ExpenseMapper expenseMapper,
                          Messages messages) {
        this.receiptRepository = receiptRepository;
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
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
                .map(receipt -> receiptMapper.toResponse(
                        receipt,
                        expenseRepository.countByReceiptId(receipt.getId())
                ))
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
        List<Expense> expenses = request.items().stream()
                .map(item -> {
                    Category category = requireCategory(item.categoryId());
                    String description = vendor.isEmpty()
                            ? item.description()
                            : item.description() + " (" + vendor + ")";

                    Expense expense = new Expense();
                    expense.setAmount(item.amount());
                    expense.setCurrency(Currency.PEN);
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

    private Category requireCategory(String categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException(messages.get("error.categoryNotFound", categoryId)));
    }
}
