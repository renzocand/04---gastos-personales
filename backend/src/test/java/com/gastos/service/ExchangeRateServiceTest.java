package com.gastos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Constructor;
import java.math.BigDecimal;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * Pruebas del servicio de tipo de cambio. Respaldan TC-19 / PA-30, PA-31
 * (valor remoto, uso de caché) y el caso de API caída sin caché (503).
 *
 * Se mockea la cadena fluida del {@link RestClient}
 * ({@code get().uri().retrieve().body()}) eslabón por eslabón —en lugar de
 * deep stubs— porque PA-31 necesita contar con precisión cuántas veces se invoca
 * {@code restClient.get()}, y los deep stubs ensucian ese conteo al navegar la
 * cadena durante el propio stubbing.
 *
 * {@code ErApiResponse} es un record privado anidado en el servicio: no se puede
 * nombrar desde el test, así que para el camino feliz se construye por reflexión
 * (el cast interno {@code body(ErApiResponse.class)} exige una instancia real de
 * ese tipo, no un mock de otra clase).
 */
@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"rawtypes", "unchecked"})
class ExchangeRateServiceTest {

    private static final String API_URL = "https://open.er-api.com/v6/latest/USD";

    @Mock private RestClient.Builder builder;
    @Mock private RestClient restClient;
    @Mock private RestClient.RequestHeadersUriSpec uriSpec;
    @Mock private RestClient.RequestHeadersSpec headersSpec;
    @Mock private RestClient.ResponseSpec responseSpec;

    private ExchangeRateService service;

    @BeforeEach
    void setUp() {
        // El servicio construye su RestClient a partir del Builder inyectado.
        when(builder.build()).thenReturn(restClient);
        service = new ExchangeRateService(builder);
    }

    /** Stubbea los tres primeros eslabones; cada test decide qué hace body(). */
    private void stubHttpChain() {
        when(restClient.get()).thenReturn(uriSpec);
        when(uriSpec.uri(API_URL)).thenReturn(headersSpec);
        when(headersSpec.retrieve()).thenReturn(responseSpec);
    }

    /** Instancia real (por reflexión) del record privado ErApiResponse. */
    private static Object erApiResponse(Map<String, BigDecimal> rates) throws Exception {
        Class<?> cls = Class.forName("com.gastos.service.ExchangeRateService$ErApiResponse");
        Constructor<?> ctor = cls.getDeclaredConstructor(String.class, Map.class);
        ctor.setAccessible(true);
        return ctor.newInstance("success", rates);
    }

    // ---- TC-19 / PA-30: Obtener tipo de cambio desde la API ----

    @Test
    @DisplayName("TC-19 / PA-30: getUsdToPen devuelve el valor PEN que reporta la API")
    void tc19_pa30_getRate_ok() throws Exception {
        stubHttpChain();
        when(responseSpec.body(any(Class.class)))
                .thenReturn(erApiResponse(Map.of("PEN", new BigDecimal("3.75"))));

        BigDecimal rate = service.getUsdToPen();

        assertThat(rate).isEqualByComparingTo("3.75");
    }

    // ---- TC-19 / PA-31: Segunda llamada usa la caché ----

    @Test
    @DisplayName("TC-19 / PA-31: la segunda llamada usa la caché y no vuelve a pegarle a la API")
    void tc19_pa31_getRate_cached() throws Exception {
        stubHttpChain();
        when(responseSpec.body(any(Class.class)))
                .thenReturn(erApiResponse(Map.of("PEN", new BigDecimal("3.75"))));

        BigDecimal first = service.getUsdToPen();
        BigDecimal second = service.getUsdToPen();

        assertThat(first).isEqualByComparingTo("3.75");
        assertThat(second).isEqualByComparingTo("3.75");
        verify(restClient, times(1)).get();
    }

    // ---- TC-19: API caída sin caché -> 503 ----

    @Test
    @DisplayName("TC-19: si la API falla y no hay caché previa lanza ResponseStatusException 503")
    void tc19_getRate_unavailable() {
        stubHttpChain();
        when(responseSpec.body(any(Class.class))).thenThrow(new RuntimeException("API caída"));

        assertThatThrownBy(() -> service.getUsdToPen())
                .isInstanceOf(ResponseStatusException.class)
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }
}
