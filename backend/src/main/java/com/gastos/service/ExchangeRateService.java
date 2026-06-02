package com.gastos.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * Obtiene el tipo de cambio USD → PEN desde una API pública, del lado del
 * servidor (antes lo pedía el navegador directamente). Cachea el valor para no
 * golpear la API externa en cada carga del dashboard; el tipo de cambio cambia
 * a diario, así que un TTL de 1 hora es de sobra.
 */
@Service
public class ExchangeRateService {

    private static final String API_URL = "https://open.er-api.com/v6/latest/USD";
    private static final Duration TTL = Duration.ofHours(1);

    private final RestClient restClient;

    private volatile BigDecimal cachedRate;
    private volatile Instant fetchedAt;

    public ExchangeRateService(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    /** Tipo de cambio USD → PEN (cacheado). Lanza 503 si no hay forma de obtenerlo. */
    public synchronized BigDecimal getUsdToPen() {
        if (isFresh()) {
            return cachedRate;
        }
        try {
            ErApiResponse resp = restClient.get()
                    .uri(API_URL)
                    .retrieve()
                    .body(ErApiResponse.class);
            BigDecimal pen = (resp != null && resp.rates() != null) ? resp.rates().get("PEN") : null;
            if (pen != null) {
                cachedRate = pen;
                fetchedAt = Instant.now();
            }
        } catch (Exception ex) {
            // Si la API externa falla pero tenemos un valor previo, lo seguimos usando.
            if (cachedRate == null) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE, "No se pudo obtener el tipo de cambio");
            }
        }
        return cachedRate;
    }

    private boolean isFresh() {
        return cachedRate != null && fetchedAt != null
                && Duration.between(fetchedAt, Instant.now()).compareTo(TTL) < 0;
    }

    /** Respuesta parcial de open.er-api.com (solo lo que usamos). */
    private record ErApiResponse(String result, Map<String, BigDecimal> rates) {
    }
}
