package com.gastos.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.gastos.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceiptRepository extends JpaRepository<Receipt, String> {

    /**
     * Lista todos los recibos del usuario ordenados por fecha descendente.
     */
    List<Receipt> findByUserDniOrderByDateDesc(String dni);

    /**
     * Busca un recibo por combinacion unica de usuario, tienda, fecha y total.
     * Util para detectar duplicados al importar recibos.
     */
    Optional<Receipt> findByUserDniAndVendorAndDateAndTotal(
            String dni,
            String vendor,
            LocalDate date,
            BigDecimal total);

    /**
     * Busca un recibo por id pero solo si pertenece al usuario dado.
     * Usado en detalle/delete: si el recibo es de otro usuario, devuelve vacio.
     */
    Optional<Receipt> findByIdAndUserDni(String id, String dni);
}
