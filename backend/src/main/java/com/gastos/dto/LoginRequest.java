package com.gastos.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Cuerpo para iniciar sesión (POST /api/auth/login).
 */
public record LoginRequest(

        @NotBlank(message = "El DNI es obligatorio")
        String dni,

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
