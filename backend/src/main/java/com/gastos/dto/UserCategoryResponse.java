package com.gastos.dto;

/**
 * Respuesta de una categoría de usuario. Compatible con CategoryResponse para
 * que el frontend pueda usar el mismo modelo.
 */
public record UserCategoryResponse(
        String id,
        String name,
        String icon,
        String color,
        String description,
        Integer sortOrder,
        boolean active
) {
}
