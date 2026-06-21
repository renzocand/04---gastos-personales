package com.gastos.service;

import com.gastos.dto.SettingsResponse;
import com.gastos.dto.SettingsUpdateRequest;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.model.User;
import com.gastos.model.UserSettings;
import com.gastos.repository.UserRepository;
import com.gastos.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gestión de la configuración del usuario (ingreso de referencia, alertas).
 * La fila de settings se crea de forma perezosa: solo al guardar por primera
 * vez. Un usuario sin configurar recibe los valores por defecto.
 */
@Service
@Transactional(readOnly = true)
public class SettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;
    private final Messages messages;

    public SettingsService(UserSettingsRepository settingsRepository, UserRepository userRepository,
                           Messages messages) {
        this.settingsRepository = settingsRepository;
        this.userRepository = userRepository;
        this.messages = messages;
    }

    /** Configuración del usuario; si no tiene fila aún, devuelve los defaults. */
    public SettingsResponse get(String dni) {
        return settingsRepository.findByUser_Dni(dni)
                .map(SettingsService::toResponse)
                .orElseGet(() -> new SettingsResponse(null, true, false, "normal", false));
    }

    /** Crea o actualiza la configuración del usuario autenticado. */
    @Transactional
    public SettingsResponse update(String dni, SettingsUpdateRequest req) {
        UserSettings settings = settingsRepository.findByUser_Dni(dni)
                .orElseGet(() -> {
                    User user = userRepository.findByDni(dni)
                            .orElseThrow(() -> new NotFoundException(messages.get("error.userNotFound", dni)));
                    return new UserSettings(user);
                });

        settings.setMonthlyIncome(req.monthlyIncome());
        settings.setAlertsEnabled(req.alertsEnabled());
        settings.setHighContrast(req.highContrast());
        // Si no llega un valor válido, conservamos "normal" como escala por defecto.
        settings.setFontScale(req.fontScale() != null ? req.fontScale() : "normal");
        settings.setReduceMotion(req.reduceMotion());

        return toResponse(settingsRepository.save(settings));
    }

    private static SettingsResponse toResponse(UserSettings s) {
        return new SettingsResponse(
                s.getMonthlyIncome(),
                s.isAlertsEnabled(),
                s.isHighContrast(),
                s.getFontScale(),
                s.isReduceMotion());
    }
}
