package com.gastos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request para crear/actualizar una categoría de usuario.
 */
public record UserCategoryRequest(

        @NotBlank(message = "{category.name.required}")
        @Size(max = 50, message = "{category.name.size}")
        String name,

        @Size(max = 50, message = "{category.icon.size}")
        String icon,

        @Size(max = 7, message = "{category.color.size}")
        String color,

        @Size(max = 500, message = "{category.description.size}")
        String description,

        Integer sortOrder
) {
}
