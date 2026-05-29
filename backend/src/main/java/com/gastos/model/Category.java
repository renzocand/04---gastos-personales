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
 * Categoría de un gasto (Comida, Transporte, Ocio, Otro).
 * El id es un código estable ("food", "transport", ...) que coincide con el
 * union type CategoryId del frontend. Las filas se siembran vía data.sql.
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
}
