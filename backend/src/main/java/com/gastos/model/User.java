package com.gastos.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Usuario de la aplicación. Se autentica por DNI + contraseña (esta última
 * guardada siempre hasheada con BCrypt, nunca en texto plano). El id es un UUID
 * generado por el backend, igual que en Expense.
 *
 * Datos obligatorios: dni, password, firstName (nombre) y lastName (primer
 * apellido). El segundo apellido y el email son opcionales.
 *
 * La tabla se llama "app_user" porque "user" es palabra reservada en MySQL.
 */
@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @Column(length = 36)
    private String id;

    /** DNI peruano (8 dígitos). Identificador de login, único. */
    @Column(nullable = false, unique = true, length = 8)
    private String dni;

    /** Hash BCrypt de la contraseña. Nunca se expone en respuestas. */
    @Column(nullable = false, length = 100)
    private String password;

    /** Nombre(s) del usuario. Obligatorio. */
    @Column(name = "first_name", nullable = false, length = 60)
    private String firstName;

    /** Primer apellido (paterno). Obligatorio. */
    @Column(name = "last_name", nullable = false, length = 60)
    private String lastName;

    /** Segundo apellido (materno). Opcional. */
    @Column(name = "second_last_name", length = 60)
    private String secondLastName;

    /** Email opcional, NO verificado. */
    @Column(length = 120)
    private String email;

    /** Rol simple para autorización ("USER", "ADMIN"). Se mapea a ROLE_xxx. */
    @Column(nullable = false, length = 20)
    private String role = "USER";

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
}
