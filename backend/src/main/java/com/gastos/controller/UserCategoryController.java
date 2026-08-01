package com.gastos.controller;

import com.gastos.dto.UserCategoryRequest;
import com.gastos.dto.UserCategoryResponse;
import com.gastos.service.UserCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints para gestión de categorías personalizadas del usuario.
 */
@RestController
@RequestMapping("/api/user-categories")
public class UserCategoryController {

    private final UserCategoryService userCategoryService;

    public UserCategoryController(UserCategoryService userCategoryService) {
        this.userCategoryService = userCategoryService;
    }

    /**
     * Lista las categorías activas del usuario autenticado.
     * GET /api/user-categories
     */
    @GetMapping
    public List<UserCategoryResponse> list(@AuthenticationPrincipal UserDetails user) {
        return userCategoryService.findByUser(user.getUsername());
    }

    /**
     * Lista todas las categorías del usuario (incluyendo inactivas).
     * GET /api/user-categories/all
     */
    @GetMapping("/all")
    public List<UserCategoryResponse> listAll(@AuthenticationPrincipal UserDetails user) {
        return userCategoryService.findAllByUser(user.getUsername());
    }

    /**
     * Obtiene una categoría por id.
     * GET /api/user-categories/{id}
     */
    @GetMapping("/{id}")
    public UserCategoryResponse getById(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String id) {
        return userCategoryService.findById(user.getUsername(), id);
    }

    /**
     * Crea una nueva categoría.
     * POST /api/user-categories
     */
    @PostMapping
    public ResponseEntity<UserCategoryResponse> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody UserCategoryRequest request) {
        UserCategoryResponse created = userCategoryService.create(user.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Actualiza una categoría existente.
     * PUT /api/user-categories/{id}
     */
    @PutMapping("/{id}")
    public UserCategoryResponse update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String id,
            @Valid @RequestBody UserCategoryRequest request) {
        return userCategoryService.update(user.getUsername(), id, request);
    }

    /**
     * Elimina (soft delete) una categoría.
     * DELETE /api/user-categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String id) {
        userCategoryService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
