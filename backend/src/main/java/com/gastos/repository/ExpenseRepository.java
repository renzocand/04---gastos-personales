package com.gastos.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.gastos.model.Currency;
import com.gastos.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, String> {

    /**
     * Lista los gastos del usuario (por DNI) aplicando filtros opcionales. Cada
     * filtro es null-safe: si el parámetro llega null, esa condición se ignora.
     * Ordena por fecha descendente (más recientes primero), igual que el frontend.
     */
    @Query("""
            SELECT e FROM Expense e
            WHERE e.user.dni = :dni
              AND (:categoryId IS NULL OR e.category.id = :categoryId)
              AND (:currency   IS NULL OR e.currency = :currency)
              AND (:dateFrom    IS NULL OR e.date >= :dateFrom)
              AND (:dateTo      IS NULL OR e.date <= :dateTo)
            ORDER BY e.date DESC, e.createdAt DESC
            """)
    List<Expense> findFiltered(
            @Param("dni") String dni,
            @Param("categoryId") String categoryId,
            @Param("currency") Currency currency,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo);

    /**
     * Busca un gasto por id pero solo si pertenece al usuario dado. Usado en
     * update/delete: si el gasto es de otro usuario, devuelve vacío (→ 404),
     * evitando que alguien modifique gastos ajenos.
     */
    Optional<Expense> findByIdAndUser_Dni(String id, String dni);

    /**
     * Lista los gastos asociados a un recibo.
     */
    List<Expense> findByReceiptId(String receiptId);

    /**
     * Cuenta los gastos asociados a un recibo.
     */
    int countByReceiptId(String receiptId);

    /**
     * Elimina todos los gastos asociados a un recibo.
     */
    void deleteByReceiptId(String receiptId);
}
