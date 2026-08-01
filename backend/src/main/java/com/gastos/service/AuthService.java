package com.gastos.service;

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
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Lógica de autenticación: registro de usuarios y login. En ambos casos emite un
 * JWT cuyo subject es el DNI. Las contraseñas se guardan hasheadas con BCrypt.
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final String BEARER = "Bearer";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserCategoryService userCategoryService;
    private final Messages messages;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       @Lazy UserCategoryService userCategoryService,
                       Messages messages) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userCategoryService = userCategoryService;
        this.messages = messages;
    }

    /** Registra un usuario nuevo y devuelve su token. Falla si el DNI ya existe. */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByDni(req.dni())) {
            throw new ConflictException(messages.get("error.dniTaken", req.dni()));
        }

        User user = new User();
        user.setDni(req.dni());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        // Campos opcionales: se normalizan a null si vienen vacíos.
        user.setSecondLastName(emptyToNull(req.secondLastName()));
        user.setEmail(emptyToNull(req.email()));
        user.setRole("USER");

        userRepository.save(user);

        // Inicializar categorías para el nuevo usuario (copia las globales)
        userCategoryService.initializeForUser(user);

        String token = jwtService.generateToken(user.getDni());
        return new AuthResponse(token, BEARER, user.getDni(), user.getFirstName(), user.getLastName());
    }

    /** Verifica credenciales (DNI + contraseña) y devuelve un token. */
    public AuthResponse login(LoginRequest req) {
        // Lanza BadCredentialsException si el DNI o la contraseña no coinciden.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.dni(), req.password()));

        User user = userRepository.findByDni(req.dni())
                .orElseThrow(() -> new NotFoundException(messages.get("error.userNotFound", req.dni())));

        String token = jwtService.generateToken(user.getDni());
        return new AuthResponse(token, BEARER, user.getDni(), user.getFirstName(), user.getLastName());
    }

    /** Datos del usuario autenticado (para GET /api/auth/me). */
    public UserResponse me(String dni) {
        User user = userRepository.findByDni(dni)
                .orElseThrow(() -> new NotFoundException(messages.get("error.userNotFound", dni)));
        return new UserResponse(
                user.getDni(),
                user.getFirstName(),
                user.getLastName(),
                user.getSecondLastName(),
                user.getEmail(),
                user.getRole());
    }

    private String emptyToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
