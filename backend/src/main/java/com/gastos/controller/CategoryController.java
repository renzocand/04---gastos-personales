package com.gastos.controller;

import java.util.List;

import com.gastos.dto.CategoryResponse;
import com.gastos.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /** GET /api/categories → las 4 categorías sembradas. */
    @GetMapping
    public List<CategoryResponse> list() {
        return categoryService.findAll();
    }
}
