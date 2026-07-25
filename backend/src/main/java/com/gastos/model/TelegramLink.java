package com.gastos.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Vinculación entre una cuenta de Telegram y un usuario de la app.
 * Un usuario puede tener múltiples cuentas de Telegram vinculadas.
 */
@Entity
@Table(name = "telegram_link")
@Getter
@Setter
@NoArgsConstructor
public class TelegramLink {

    @Id
    @Column(length = 36)
    private String id;

    /** ID de Telegram del usuario (chat_id). Único. */
    @Column(name = "telegram_id", nullable = false, unique = true)
    private Long telegramId;

    /** Usuario vinculado. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Nombre de Telegram para referencia. */
    @Column(name = "telegram_username", length = 100)
    private String telegramUsername;

    /** Nombre completo en Telegram. */
    @Column(name = "telegram_name", length = 200)
    private String telegramName;

    @CreationTimestamp
    @Column(name = "linked_at", updatable = false)
    private Instant linkedAt;

    @PrePersist
    void assignId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    public TelegramLink(Long telegramId, User user, String telegramUsername, String telegramName) {
        this.telegramId = telegramId;
        this.user = user;
        this.telegramUsername = telegramUsername;
        this.telegramName = telegramName;
    }
}
