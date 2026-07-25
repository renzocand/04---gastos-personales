package com.gastos.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Boleta o recibo. Representa un documento de compra que puede tener uno o
 * varios gastos asociados. El id es un UUID generado por el backend.
 */
@Entity
@Table(name = "receipt")
@Getter
@Setter
@NoArgsConstructor
public class Receipt {

    @Id
    @Column(length = 36)
    private String id;

    /** Nombre de la tienda o establecimiento. */
    @Column(length = 100)
    private String vendor;

    /** Fecha del documento (boleta/factura). */
    @Column(nullable = false)
    private LocalDate date;

    /** Total del documento. */
    @Column(precision = 12, scale = 2)
    private BigDecimal total;

    /** Origen del recibo: MANUAL, TELEGRAM o WEB_OCR. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReceiptSource source;

    /** URL de la imagen original del recibo (si aplica). */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Dueño del recibo. Cada usuario solo ve y gestiona los suyos. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    /** Genera el UUID al insertar si aun no tiene id. */
    @PrePersist
    void assignId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
