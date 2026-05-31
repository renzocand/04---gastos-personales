package com.gastos.security;

import com.gastos.model.User;
import com.gastos.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Carga el usuario para Spring Security a partir del DNI. Devuelve un UserDetails
 * estándar con el rol mapeado a la autoridad ROLE_xxx.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** El "username" en este sistema es el DNI. */
    @Override
    public UserDetails loadUserByUsername(String dni) throws UsernameNotFoundException {
        User user = userRepository.findByDni(dni)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + dni));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getDni())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole())
                .build();
    }
}
