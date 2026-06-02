package com.gastos.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Cuerpo para iniciar sesión (POST /api/auth/login).
 */
public record LoginRequest(

        @NotBlank(message = "{login.dni.required}")
        String dni,

        @NotBlank(message = "{login.password.required}")
        String password
) {
}
