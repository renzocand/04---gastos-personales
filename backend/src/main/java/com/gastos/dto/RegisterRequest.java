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

        @NotBlank(message = "El DNI es obligatorio")
        @Pattern(regexp = "\\d{8}", message = "El DNI debe tener exactamente 8 dígitos")
        String dni,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 72, message = "La contraseña debe tener entre 6 y 72 caracteres")
        String password,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 60, message = "El nombre no puede superar 60 caracteres")
        String firstName,

        @NotBlank(message = "El primer apellido es obligatorio")
        @Size(max = 60, message = "El primer apellido no puede superar 60 caracteres")
        String lastName,

        @Size(max = 60, message = "El segundo apellido no puede superar 60 caracteres")
        String secondLastName,

        @Email(message = "El email no tiene un formato válido")
        @Size(max = 120, message = "El email no puede superar 120 caracteres")
        String email
) {
}
