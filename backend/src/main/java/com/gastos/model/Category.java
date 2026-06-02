package com.gastos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Categoría de un gasto (Comida, Transporte, Salud, ...). El id es un código
 * estable ("food", "transport", ...) que el frontend usa como clave de join.
 * Las filas se siembran vía data.sql (origen de verdad de la lista y los nombres).
 */
@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 50)
    private String icon;

    /** Descripción educativa: qué tipo de gastos van en esta categoría. */
    @Column(length = 200)
    private String description;

    /** Orden de presentación en la UI. Lo define el seed (data.sql). */
    @Column(name = "sort_order")
    private Integer sortOrder;
}
