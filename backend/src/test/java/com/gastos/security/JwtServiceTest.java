package com.gastos.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Pruebas de emisión/validación de JWT. No requieren Spring: se instancia el
 * servicio con un secreto de prueba. Respaldan la seguridad detrás de TC-14/TC-15
 * y la restricción de acceso de PA-25 (token inválido ⇒ sin acceso).
 */
class JwtServiceTest {

    // 40 bytes ≥ los 32 que exige HS256.
    private static final String SECRET = "0123456789012345678901234567890123456789";
    private static final String DNI = "12345678";

    private JwtService jwt(long expirationMs) {
        return new JwtService(SECRET, expirationMs);
    }

    @Test
    @DisplayName("generateToken → extractDni recupera el mismo DNI (round-trip)")
    void roundTrip() {
        JwtService service = jwt(3_600_000);
        String token = service.generateToken(DNI);

        assertThat(service.extractDni(token)).isEqualTo(DNI);
    }

    @Test
    @DisplayName("isTokenValid es true para el DNI correcto y false para otro")
    void validForMatchingDni() {
        JwtService service = jwt(3_600_000);
        String token = service.generateToken(DNI);

        assertThat(service.isTokenValid(token, DNI)).isTrue();
        assertThat(service.isTokenValid(token, "99999999")).isFalse();
    }

    @Test
    @DisplayName("Un token expirado es rechazado al validarse")
    void expiredTokenRejected() {
        JwtService service = jwt(-1_000); // ya nace expirado
        String token = service.generateToken(DNI);

        assertThatThrownBy(() -> service.isTokenValid(token, DNI))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Un token manipulado (firma inválida) lanza JwtException")
    void tamperedTokenRejected() {
        JwtService service = jwt(3_600_000);
        String tampered = service.generateToken(DNI) + "tampered";

        assertThatThrownBy(() -> service.extractDni(tampered))
                .isInstanceOf(JwtException.class);
    }
}
