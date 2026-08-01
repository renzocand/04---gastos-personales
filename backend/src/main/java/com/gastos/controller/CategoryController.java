package com.gastos.controller;

import java.util.List;

import com.gastos.dto.CategoryResponse;
import com.gastos.dto.UserCategoryResponse;
import com.gastos.service.CategoryService;
import com.gastos.service.UserCategoryService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserCategoryService userCategoryService;

    public CategoryController(CategoryService categoryService,
                              UserCategoryService userCategoryService) {
        this.categoryService = categoryService;
        this.userCategoryService = userCategoryService;
    }

    /**
     * GET /api/categories → las categorías del usuario autenticado.
     * Retorna UserCategoryResponse que es compatible con CategoryResponse.
     */
    @GetMapping
    public List<UserCategoryResponse> list(@AuthenticationPrincipal UserDetails user) {
        return userCategoryService.findByUser(user.getUsername());
    }

    /**
     * GET /api/categories/templates → las categorías globales (plantillas para nuevos usuarios).
     */
    @GetMapping("/templates")
    public List<CategoryResponse> listTemplates() {
        return categoryService.findAll();
    }
}
