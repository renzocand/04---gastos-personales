package com.gastos.service;

import java.time.LocalDate;
import java.util.List;

import com.gastos.dto.ExpenseRequest;
import com.gastos.dto.ExpenseResponse;
import com.gastos.dto.ExpenseUpdateRequest;
import com.gastos.exception.NotFoundException;
import com.gastos.mapper.ExpenseMapper;
import com.gastos.model.Category;
import com.gastos.model.Currency;
import com.gastos.model.Expense;
import com.gastos.repository.CategoryRepository;
import com.gastos.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lógica de negocio de gastos: listado con filtros y CRUD. Resuelve la
 * categoría referenciada y valida su existencia antes de persistir.
 */
@Service
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseMapper mapper;

    public ExpenseService(ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          ExpenseMapper mapper) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.mapper = mapper;
    }

    public List<ExpenseResponse> findAll(String categoryId, Currency currency,
                                         LocalDate dateFrom, LocalDate dateTo) {
        return expenseRepository.findFiltered(categoryId, currency, dateFrom, dateTo).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public ExpenseResponse create(ExpenseRequest req) {
        Category category = requireCategory(req.categoryId());
        Expense saved = expenseRepository.save(mapper.toEntity(req, category));
        return mapper.toResponse(saved);
    }

    @Transactional
    public ExpenseResponse update(String id, ExpenseUpdateRequest req) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Gasto no encontrado: " + id));

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
    public void delete(String id) {
        if (!expenseRepository.existsById(id)) {
            throw new NotFoundException("Gasto no encontrado: " + id);
        }
        expenseRepository.deleteById(id);
    }

    private Category requireCategory(String categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada: " + categoryId));
    }
}
