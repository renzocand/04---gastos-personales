package com.gastos.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.gastos.i18n.Messages;
import com.gastos.model.User;
import com.gastos.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Pruebas de la carga de usuarios para Spring Security. Respaldan TC-18 / PA-29
 * (UserDetails con autoridad ROLE_xxx) y el caso de usuario inexistente.
 */
@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    private static final String DNI = "12345678";

    @Mock private UserRepository userRepository;
    @Mock private Messages messages;

    @InjectMocks private CustomUserDetailsService service;

    // ---- TC-18 / PA-29: Cargar usuario por DNI ----

    @Test
    @DisplayName("TC-18 / PA-29: loadUserByUsername mapea DNI, password y autoridad ROLE_USER")
    void tc18_pa29_loadUser_ok() {
        User user = new User();
        user.setDni(DNI);
        user.setPassword("hashed-pw");
        user.setRole("USER");
        when(userRepository.findByDni(DNI)).thenReturn(Optional.of(user));

        UserDetails details = service.loadUserByUsername(DNI);

        assertThat(details.getUsername()).isEqualTo(DNI);
        assertThat(details.getPassword()).isEqualTo("hashed-pw");
        assertThat(details.getAuthorities()).extracting("authority").contains("ROLE_USER");
    }

    @Test
    @DisplayName("TC-18: loadUserByUsername con DNI inexistente lanza UsernameNotFoundException")
    void tc18_loadUser_notFound() {
        when(userRepository.findByDni(DNI)).thenReturn(Optional.empty());
        when(messages.get(anyString(), any())).thenReturn("Usuario no encontrado");

        assertThatThrownBy(() -> service.loadUserByUsername(DNI))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
