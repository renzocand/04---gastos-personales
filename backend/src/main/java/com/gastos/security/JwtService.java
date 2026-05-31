package com.gastos.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Emisión y verificación de JWT firmados con HMAC-SHA256. El "subject" del token
 * es el DNI del usuario. La clave secreta y la expiración se leen de la config
 * (app.jwt.*), con valores por defecto para desarrollo.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        // La clave debe tener al menos 256 bits (32 bytes) para HS256.
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /** Genera un token cuyo subject es el DNI dado. */
    public String generateToken(String dni) {
        Date now = new Date();
        return Jwts.builder()
                .subject(dni)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    /** Extrae el DNI (subject) del token; lanza JwtException si es inválido. */
    public String extractDni(String token) {
        return parse(token).getSubject();
    }

    /** Verdadero si el token corresponde al DNI dado y no ha expirado. */
    public boolean isTokenValid(String token, String dni) {
        Claims claims = parse(token);
        return claims.getSubject().equals(dni) && claims.getExpiration().after(new Date());
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
