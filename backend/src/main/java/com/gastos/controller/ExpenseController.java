package com.gastos.controller;

import java.time.LocalDate;
import java.util.List;

import com.gastos.dto.ExpenseRequest;
import com.gastos.dto.ExpenseResponse;
import com.gastos.dto.ExpenseUpdateRequest;
import com.gastos.model.Currency;
import com.gastos.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    /** GET /api/expenses?categoryId=&currency=&dateFrom=&dateTo= (todos opcionales). */
    @GetMapping
    public List<ExpenseResponse> list(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Currency currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return expenseService.findAll(categoryId, currency, dateFrom, dateTo);
    }

    /** POST /api/expenses → crea un gasto. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@Valid @RequestBody ExpenseRequest request) {
        return expenseService.create(request);
    }

    /** PATCH /api/expenses/{id} → actualización parcial. */
    @PatchMapping("/{id}")
    public ExpenseResponse update(@PathVariable String id,
                                  @Valid @RequestBody ExpenseUpdateRequest request) {
        return expenseService.update(id, request);
    }

    /** DELETE /api/expenses/{id}. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        expenseService.delete(id);
    }
}
