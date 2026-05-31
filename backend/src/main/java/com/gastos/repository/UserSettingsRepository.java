package com.gastos.repository;

import java.util.Optional;

import com.gastos.model.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingsRepository extends JpaRepository<UserSettings, String> {

    /** Busca la configuración de un usuario por su DNI. */
    Optional<UserSettings> findByUser_Dni(String dni);
}
