package com.gastos.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Código temporal para vincular Telegram con una cuenta.
 * Válido por 5 minutos. Se elimina al usarse o expirar.
 */
@Entity
@Table(name = "telegram_link_code")
@Getter
@Setter
@NoArgsConstructor
public class TelegramLinkCode {

    @Id
    @Column(length = 36)
    private String id;

    /** Código de 6 caracteres alfanuméricos (mayúsculas). */
    @Column(nullable = false, unique = true, length = 6)
    private String code;

    /** Usuario que generó el código. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    /** Momento de expiración (5 minutos después de creación). */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    void assignId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    public TelegramLinkCode(String code, User user, Instant expiresAt) {
        this.code = code;
        this.user = user;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
