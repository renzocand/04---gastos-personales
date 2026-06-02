package com.gastos.service;

import java.time.LocalDate;
import java.util.List;

import com.gastos.dto.ExpenseRequest;
import com.gastos.dto.ExpenseResponse;
import com.gastos.dto.ExpenseUpdateRequest;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.mapper.ExpenseMapper;
import com.gastos.model.Category;
import com.gastos.model.Currency;
import com.gastos.model.Expense;
import com.gastos.model.User;
import com.gastos.repository.CategoryRepository;
import com.gastos.repository.ExpenseRepository;
import com.gastos.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lógica de negocio de gastos: listado con filtros y CRUD, siempre acotado al
 * usuario autenticado (identificado por su DNI). Resuelve la categoría y el
 * dueño antes de persistir, y solo permite modificar/borrar gastos propios.
 */
@Service
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseMapper mapper;
    private final Messages messages;

    public ExpenseService(ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository,
                          ExpenseMapper mapper,
                          Messages messages) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.messages = messages;
    }

    public List<ExpenseResponse> findAll(String dni, String categoryId, Currency currency,
                                         LocalDate dateFrom, LocalDate dateTo) {
        return expenseRepository.findFiltered(dni, categoryId, currency, dateFrom, dateTo).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public ExpenseResponse create(String dni, ExpenseRequest req) {
        User user = requireUser(dni);
        Category category = requireCategory(req.categoryId());
        Expense saved = expenseRepository.save(mapper.toEntity(req, category, user));
        return mapper.toResponse(saved);
    }

    @Transactional
    public ExpenseResponse update(String dni, String id, ExpenseUpdateRequest req) {
        Expense expense = requireOwnedExpense(dni, id);

        if (req.amount() != null) {
            expense.setAmount(req.amount());
        }
        if (req.currency() != null) {
            expense.setCurrency(req.currency());
        }
        if (req.description() != null) {
            expense.setDescription(req.description());
        }
        if (req.date() != null) {
            expense.setDate(req.date());
        }
        if (req.categoryId() != null) {
            expense.setCategory(requireCategory(req.categoryId()));
        }

        return mapper.toResponse(expense);
    }

    @Transactional
    public void delete(String dni, String id) {
        Expense expense = requireOwnedExpense(dni, id);
        expenseRepository.delete(expense);
    }

    /** Recupera un gasto solo si pertenece al usuario; si no, 404. */
    private Expense requireOwnedExpense(String dni, String id) {
        return expenseRepository.findByIdAndUser_Dni(id, dni)
                .orElseThrow(() -> new NotFoundException(messages.get("error.expenseNotFound", id)));
    }

    private Category requireCategory(String categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException(messages.get("error.categoryNotFound", categoryId)));
    }

    private User requireUser(String dni) {
        return userRepository.findByDni(dni)
                .orElseThrow(() -> new NotFoundException(messages.get("error.userNotFound", dni)));
    }
}
