package com.gastos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import com.gastos.dto.SettingsResponse;
import com.gastos.dto.SettingsUpdateRequest;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.model.User;
import com.gastos.model.UserSettings;
import com.gastos.repository.UserRepository;
import com.gastos.repository.UserSettingsRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Pruebas de la configuración del usuario (ingreso, alertas, accesibilidad).
 * Respaldan TC-06..TC-08 y PA-11, PA-12, PA-14.
 */
@ExtendWith(MockitoExtension.class)
class SettingsServiceTest {

    private static final String DNI = "12345678";

    @Mock private UserSettingsRepository settingsRepository;
    @Mock private UserRepository userRepository;
    @Mock private Messages messages;

    @InjectMocks private SettingsService service;

    private UserSettings existingSettings() {
        User user = new User();
        user.setDni(DNI);
        UserSettings s = new UserSettings(user);
        s.setMonthlyIncome(new BigDecimal("3000.00"));
        s.setAlertsEnabled(true);
        s.setHighContrast(false);
        s.setFontScale("large");
        s.setReduceMotion(false);
        return s;
    }

    // ---- TC-06 / PA-11: Consultar configuración financiera ----

    @Test
    @DisplayName("TC-06 / PA-11: get devuelve el ingreso y las alertas guardadas")
    void tc06_pa11_get_existing() {
        when(settingsRepository.findByUser_Dni(DNI)).thenReturn(Optional.of(existingSettings()));

        SettingsResponse res = service.get(DNI);

        assertThat(res.monthlyIncome()).isEqualByComparingTo("3000.00");
        assertThat(res.alertsEnabled()).isTrue();
        assertThat(res.fontScale()).isEqualTo("large");
    }

    @Test
    @DisplayName("TC-06: get sin configuración previa devuelve los valores por defecto")
    void tc06_get_defaults() {
        when(settingsRepository.findByUser_Dni(DNI)).thenReturn(Optional.empty());

        SettingsResponse res = service.get(DNI);

        assertThat(res.monthlyIncome()).isNull();
        assertThat(res.alertsEnabled()).isTrue();
        assertThat(res.highContrast()).isFalse();
        assertThat(res.fontScale()).isEqualTo("normal");
        assertThat(res.reduceMotion()).isFalse();
    }

    // ---- TC-07 / PA-12: Actualizar ingreso mensual ----

    @Test
    @DisplayName("TC-07 / PA-12: update crea la configuración y guarda el ingreso si no existía")
    void tc07_pa12_update_createsAndSavesIncome() {
        when(settingsRepository.findByUser_Dni(DNI)).thenReturn(Optional.empty());
        when(userRepository.findByDni(DNI)).thenReturn(Optional.of(existingSettings().getUser()));
        when(settingsRepository.save(any(UserSettings.class))).thenAnswer(inv -> inv.getArgument(0));

        SettingsUpdateRequest req = new SettingsUpdateRequest(
                new BigDecimal("4500.00"), true, false, "normal", false);

        SettingsResponse res = service.update(DNI, req);

        assertThat(res.monthlyIncome()).isEqualByComparingTo("4500.00");
    }

    @Test
    @DisplayName("TC-07: update con usuario inexistente lanza NotFoundException")
    void tc07_update_userNotFound() {
        when(settingsRepository.findByUser_Dni(DNI)).thenReturn(Optional.empty());
        when(userRepository.findByDni(DNI)).thenReturn(Optional.empty());
        when(messages.get(anyString(), any())).thenReturn("Usuario no encontrado");

        SettingsUpdateRequest req = new SettingsUpdateRequest(
                BigDecimal.TEN, true, false, "normal", false);

        assertThatThrownBy(() -> service.update(DNI, req)).isInstanceOf(NotFoundException.class);
    }

    // ---- TC-08 / PA-14: Configurar alertas (+ fallback de fontScale) ----

    @Test
    @DisplayName("TC-08 / PA-14: update cambia el estado de alertas; fontScale null cae a 'normal'")
    void tc08_pa14_update_alertsAndFontScaleFallback() {
        when(settingsRepository.findByUser_Dni(DNI)).thenReturn(Optional.of(existingSettings()));
        when(settingsRepository.save(any(UserSettings.class))).thenAnswer(inv -> inv.getArgument(0));

        // alertsEnabled=false y fontScale=null para verificar el fallback a "normal".
        SettingsUpdateRequest req = new SettingsUpdateRequest(
                new BigDecimal("3000.00"), false, false, null, false);

        SettingsResponse res = service.update(DNI, req);

        assertThat(res.alertsEnabled()).isFalse();
        assertThat(res.fontScale()).isEqualTo("normal");
    }
}
