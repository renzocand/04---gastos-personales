package com.gastos.repository;

import java.util.Optional;

import com.gastos.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {

    /** Busca un usuario por su DNI (clave de login). */
    Optional<User> findByDni(String dni);

    /** Comprueba si ya existe un usuario con ese DNI (validación de registro). */
    boolean existsByDni(String dni);
}
