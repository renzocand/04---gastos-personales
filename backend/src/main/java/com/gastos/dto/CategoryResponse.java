package com.gastos.dto;

/**
 * Respuesta de una categoría. Coincide con la interface Category del frontend.
 */
public record CategoryResponse(
        String id,
        String name,
        String icon,
        String description
) {
}
