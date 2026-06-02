package com.gastos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo para registrar un usuario (POST /api/auth/register).
 * Obligatorios: dni, password, firstName, lastName.
 * Opcionales: secondLastName, email.
 */
public record RegisterRequest(

        @NotBlank(message = "{register.dni.required}")
        @Pattern(regexp = "\\d{8}", message = "{register.dni.pattern}")
        String dni,

        @NotBlank(message = "{register.password.required}")
        @Size(min = 6, max = 72, message = "{register.password.size}")
        String password,

        @NotBlank(message = "{register.firstName.required}")
        @Size(max = 60, message = "{register.firstName.size}")
        String firstName,

        @NotBlank(message = "{register.lastName.required}")
        @Size(max = 60, message = "{register.lastName.size}")
        String lastName,

        @Size(max = 60, message = "{register.secondLastName.size}")
        String secondLastName,

        @Email(message = "{register.email.invalid}")
        @Size(max = 120, message = "{register.email.size}")
        String email
) {
}
