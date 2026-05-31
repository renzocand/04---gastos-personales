package com.gastos.dto;

/**
 * Datos públicos del usuario autenticado (GET /api/auth/me).
 * Nunca incluye la contraseña.
 */
public record UserResponse(
        String dni,
        String firstName,
        String lastName,
        String secondLastName,
        String email,
        String role
) {
}
