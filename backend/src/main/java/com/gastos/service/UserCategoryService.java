package com.gastos.service;

import com.gastos.dto.UserCategoryRequest;
import com.gastos.dto.UserCategoryResponse;
import com.gastos.exception.BadRequestException;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.model.Category;
import com.gastos.model.User;
import com.gastos.model.UserCategory;
import com.gastos.repository.CategoryRepository;
import com.gastos.repository.UserCategoryRepository;
import com.gastos.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestión de categorías personalizadas por usuario.
 */
@Service
@Transactional(readOnly = true)
public class UserCategoryService {

    private final UserCategoryRepository userCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final Messages messages;

    public UserCategoryService(UserCategoryRepository userCategoryRepository,
                               CategoryRepository categoryRepository,
                               UserRepository userRepository,
                               Messages messages) {
        this.userCategoryRepository = userCategoryRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.messages = messages;
    }

    /**
     * Lista las categorías activas del usuario.
     */
    public List<UserCategoryResponse> findByUser(String dni) {
        User user = requireUser(dni);
        return userCategoryRepository.findByUserIdAndActiveTrueOrderBySortOrder(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lista todas las categorías del usuario (incluyendo inactivas).
     */
    public List<UserCategoryResponse> findAllByUser(String dni) {
        User user = requireUser(dni);
        return userCategoryRepository.findByUserIdOrderBySortOrder(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Obtiene una categoría por id.
     */
    public UserCategoryResponse findById(String dni, String categoryId) {
        User user = requireUser(dni);
        UserCategory category = requireOwnedCategory(user.getId(), categoryId);
        return toResponse(category);
    }

    /**
     * Crea una nueva categoría para el usuario.
     */
    @Transactional
    public UserCategoryResponse create(String dni, UserCategoryRequest request) {
        User user = requireUser(dni);

        // Verificar que no exista otra categoría activa con el mismo nombre
        if (userCategoryRepository.findByUserIdAndNameAndActiveTrue(user.getId(), request.name()).isPresent()) {
            throw new BadRequestException("Ya existe una categoría con ese nombre");
        }

        int nextOrder = userCategoryRepository.countByUserIdAndActiveTrue(user.getId()) + 1;

        UserCategory category = new UserCategory(
                user,
                request.name(),
                request.icon(),
                request.description(),
                request.sortOrder() != null ? request.sortOrder() : nextOrder
        );

        return toResponse(userCategoryRepository.save(category));
    }

    /**
     * Actualiza una categoría existente.
     */
    @Transactional
    public UserCategoryResponse update(String dni, String categoryId, UserCategoryRequest request) {
        User user = requireUser(dni);
        UserCategory category = requireOwnedCategory(user.getId(), categoryId);

        // Verificar que no exista otra categoría activa con el mismo nombre
        userCategoryRepository.findByUserIdAndNameAndActiveTrue(user.getId(), request.name())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(categoryId)) {
                        throw new BadRequestException("Ya existe una categoría con ese nombre");
                    }
                });

        category.setName(request.name());
        category.setIcon(request.icon());
        category.setDescription(request.description());
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        return toResponse(category);
    }

    /**
     * Elimina (soft delete) una categoría.
     */
    @Transactional
    public void delete(String dni, String categoryId) {
        User user = requireUser(dni);
        UserCategory category = requireOwnedCategory(user.getId(), categoryId);

        // Soft delete: marcamos como inactiva
        category.setActive(false);
    }

    /**
     * Inicializa categorías para un nuevo usuario copiando las categorías globales.
     */
    @Transactional
    public void initializeForUser(User user) {
        // Si ya tiene categorías, no hacer nada
        if (userCategoryRepository.existsByUserId(user.getId())) {
            return;
        }

        // Copiar categorías globales
        List<Category> globalCategories = categoryRepository.findAll(Sort.by("sortOrder"));
        for (Category global : globalCategories) {
            UserCategory userCategory = new UserCategory(
                    user,
                    global.getName(),
                    global.getIcon(),
                    global.getDescription(),
                    global.getSortOrder()
            );
            userCategoryRepository.save(userCategory);
        }
    }

    /**
     * Obtiene la entidad UserCategory (para uso interno por otros servicios).
     */
    public UserCategory requireCategory(String categoryId) {
        return userCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException(messages.get("error.categoryNotFound", categoryId)));
    }

    /**
     * Obtiene la entidad UserCategory verificando que pertenece al usuario.
     */
    public UserCategory requireOwnedCategory(String userId, String categoryId) {
        return userCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new NotFoundException(messages.get("error.categoryNotFound", categoryId)));
    }

    private User requireUser(String dni) {
        return userRepository.findByDni(dni)
                .orElseThrow(() -> new NotFoundException(messages.get("error.userNotFound", dni)));
    }

    private UserCategoryResponse toResponse(UserCategory category) {
        return new UserCategoryResponse(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getDescription(),
                category.getSortOrder(),
                category.isActive()
        );
    }
}
