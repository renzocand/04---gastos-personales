package com.gastos.repository;

import java.time.LocalDate;
import java.util.List;

import com.gastos.model.Currency;
import com.gastos.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, String> {

    /**
     * Lista gastos aplicando filtros opcionales. Cada filtro es null-safe:
     * si el parámetro llega null, esa condición se ignora. Ordena por fecha
     * descendente (más recientes primero), igual que la lista del frontend.
     */
    @Query("""
            SELECT e FROM Expense e
            WHERE (:categoryId IS NULL OR e.category.id = :categoryId)
              AND (:currency   IS NULL OR e.currency = :currency)
              AND (:dateFrom    IS NULL OR e.date >= :dateFrom)
              AND (:dateTo      IS NULL OR e.date <= :dateTo)
            ORDER BY e.date DESC, e.createdAt DESC
            """)
    List<Expense> findFiltered(
            @Param("categoryId") String categoryId,
            @Param("currency") Currency currency,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo);
}
