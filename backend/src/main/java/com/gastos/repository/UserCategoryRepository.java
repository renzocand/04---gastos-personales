package com.gastos.repository;

import com.gastos.model.UserCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCategoryRepository extends JpaRepository<UserCategory, String> {

    /**
     * Lista categorías activas del usuario ordenadas por sortOrder.
     */
    List<UserCategory> findByUserIdAndActiveTrueOrderBySortOrder(String userId);

    /**
     * Lista todas las categorías del usuario (incluyendo inactivas).
     */
    List<UserCategory> findByUserIdOrderBySortOrder(String userId);

    /**
     * Busca una categoría por id y userId (para verificar propiedad).
     */
    Optional<UserCategory> findByIdAndUserId(String id, String userId);

    /**
     * Busca una categoría activa por nombre y usuario (para evitar duplicados).
     */
    Optional<UserCategory> findByUserIdAndNameAndActiveTrue(String userId, String name);

    /**
     * Cuenta categorías activas del usuario.
     */
    int countByUserIdAndActiveTrue(String userId);

    /**
     * Verifica si el usuario tiene categorías.
     */
    boolean existsByUserId(String userId);
}
