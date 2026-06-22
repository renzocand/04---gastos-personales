package com.gastos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.gastos.dto.AuthResponse;
import com.gastos.dto.LoginRequest;
import com.gastos.dto.RegisterRequest;
import com.gastos.dto.UserResponse;
import com.gastos.exception.ConflictException;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.model.User;
import com.gastos.repository.UserRepository;
import com.gastos.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;

/**
 * Pruebas de registro e inicio de sesión. Respaldan TC-13, TC-14 y
 * PA-20..PA-23 (registro exitoso, DNI duplicado, login válido e inválido).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String DNI = "12345678";

    @Mock private UserRepository userRepository;
    @Mock private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private Messages messages;

    @InjectMocks private AuthService service;

    // ---- TC-13 / PA-20: Registrar usuario ----

    @Test
    @DisplayName("TC-13 / PA-20: register codifica la contraseña, normaliza opcionales y devuelve token")
    void tc13_pa20_register_ok() {
        // secondLastName y email vacíos deben normalizarse a null; firstName con espacios se recorta.
        RegisterRequest req = new RegisterRequest(
                DNI, "secret123", "  Renzo  ", "Candiotti", "   ", "");

        when(userRepository.existsByDni(DNI)).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed-pw");
        when(jwtService.generateToken(DNI)).thenReturn("jwt-token");

        AuthResponse res = service.register(req);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getPassword()).isEqualTo("hashed-pw");
        assertThat(saved.getFirstName()).isEqualTo("Renzo");
        assertThat(saved.getRole()).isEqualTo("USER");
        assertThat(saved.getSecondLastName()).isNull();
        assertThat(saved.getEmail()).isNull();

        assertThat(res.token()).isEqualTo("jwt-token");
        assertThat(res.dni()).isEqualTo(DNI);
    }

    // ---- TC-13 / PA-21: DNI ya registrado ----

    @Test
    @DisplayName("TC-13 / PA-21: register con DNI existente lanza ConflictException y no guarda")
    void tc13_pa21_register_duplicateDni() {
        RegisterRequest req = new RegisterRequest(
                DNI, "secret123", "Renzo", "Candiotti", null, null);
        when(userRepository.existsByDni(DNI)).thenReturn(true);
        when(messages.get(anyString(), any())).thenReturn("DNI ya registrado");

        assertThatThrownBy(() -> service.register(req)).isInstanceOf(ConflictException.class);
        verify(userRepository, never()).save(any());
    }

    // ---- TC-14 / PA-22: Iniciar sesión válido ----

    @Test
    @DisplayName("TC-14 / PA-22: login con credenciales válidas devuelve token")
    void tc14_pa22_login_ok() {
        User user = new User();
        user.setDni(DNI);
        user.setFirstName("Renzo");
        user.setLastName("Candiotti");
        when(userRepository.findByDni(DNI)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(DNI)).thenReturn("jwt-token");

        AuthResponse res = service.login(new LoginRequest(DNI, "secret123"));

        assertThat(res.token()).isEqualTo("jwt-token");
        assertThat(res.firstName()).isEqualTo("Renzo");
    }

    // ---- TC-14 / PA-23: Credenciales inválidas ----

    @Test
    @DisplayName("TC-14 / PA-23: login con credenciales inválidas propaga BadCredentialsException")
    void tc14_pa23_login_badCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> service.login(new LoginRequest(DNI, "wrong")))
                .isInstanceOf(BadCredentialsException.class);
        verify(userRepository, never()).findByDni(anyString());
    }

    // ---- TC-15 / PA-24: Datos del usuario autenticado (GET /api/auth/me) ----

    @Test
    @DisplayName("TC-15 / PA-24: me devuelve los datos públicos del usuario hallado por DNI")
    void tc15_pa24_me_ok() {
        User user = new User();
        user.setDni(DNI);
        user.setFirstName("Renzo");
        user.setLastName("Candiotti");
        user.setSecondLastName("Quispe");
        user.setEmail("renzo@example.com");
        user.setRole("USER");
        when(userRepository.findByDni(DNI)).thenReturn(Optional.of(user));

        UserResponse res = service.me(DNI);

        assertThat(res.dni()).isEqualTo(DNI);
        assertThat(res.firstName()).isEqualTo("Renzo");
        assertThat(res.lastName()).isEqualTo("Candiotti");
        assertThat(res.secondLastName()).isEqualTo("Quispe");
        assertThat(res.email()).isEqualTo("renzo@example.com");
        assertThat(res.role()).isEqualTo("USER");
    }

    @Test
    @DisplayName("TC-15: me con DNI inexistente lanza NotFoundException")
    void tc15_me_userNotFound() {
        when(userRepository.findByDni(DNI)).thenReturn(Optional.empty());
        when(messages.get(anyString(), any())).thenReturn("Usuario no encontrado");

        assertThatThrownBy(() -> service.me(DNI)).isInstanceOf(NotFoundException.class);
    }
}
