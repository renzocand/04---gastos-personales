package com.gastos.controller;

import com.gastos.dto.AuthResponse;
import com.gastos.dto.LoginRequest;
import com.gastos.dto.RegisterRequest;
import com.gastos.dto.UserResponse;
import com.gastos.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de autenticación. /register y /login son públicos; /me requiere un
 * token JWT válido (el DNI se obtiene del usuario autenticado).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register → crea un usuario y devuelve su token. */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /** POST /api/auth/login → valida credenciales y devuelve un token. */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** GET /api/auth/me → datos del usuario autenticado. */
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        // authentication.getName() es el DNI (subject del token / username del UserDetails).
        return authService.me(authentication.getName());
    }
}
