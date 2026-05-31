package com.gastos.dto;

/**
 * Respuesta tras un registro o login exitoso. Incluye el token JWT que el
 * frontend debe enviar en la cabecera Authorization: Bearer &lt;token&gt;.
 */
public record AuthResponse(
        String token,
        String tokenType,
        String dni,
        String firstName,
        String lastName
) {
}
