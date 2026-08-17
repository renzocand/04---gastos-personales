package com.gastos.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Categoría personalizada de un usuario. Cada usuario tiene sus propias categorías
 * que puede crear, editar y eliminar (soft delete). Reemplaza a Category global
 * para la clasificación de gastos.
 */
@Entity
@Table(name = "user_category")
@Getter
@Setter
@NoArgsConstructor
public class UserCategory {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 50)
    private String icon;

    /** Color hex para gráficos (ej: "#8b5cf6"). */
    @Column(length = 7)
    private String color;

    /** Descripción/contexto para que la IA entienda cuándo usar esta categoría. */
    @Column(length = 500)
    private String description;

    /** Orden de presentación en la UI. */
    @Column(name = "sort_order")
    private Integer sortOrder;

    /** Soft delete: false indica que la categoría fue eliminada pero se mantiene para históricos. */
    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    /** Genera el UUID al insertar si aún no tiene id. */
    @PrePersist
    void assignId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    public UserCategory(User user, String name, String icon, String color, String description, Integer sortOrder) {
        this.user = user;
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.description = description;
        this.sortOrder = sortOrder;
        this.active = true;
    }
}
