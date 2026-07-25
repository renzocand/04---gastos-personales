package com.gastos.ocr.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.gastos.ocr.dto.ProcessedReceipt;
import com.gastos.ocr.exception.OcrException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    private WebClient webClient;
    private ObjectMapper objectMapper;

    private static final String VISION_PROMPT = """
            Analiza esta imagen de una boleta/factura peruana y extrae la información.

            CATEGORÍAS DISPONIBLES (usa SOLO estos IDs exactos):
            - food: Comida (mercado, restaurantes, alimentos, bebidas, snacks)
            - transport: Transporte (taxi, gasolina, pasajes, peajes)
            - housing: Vivienda (alquiler, hipoteca, mantenimiento estructural)
            - services: Servicios (luz, agua, gas, internet, teléfono)
            - health: Salud (farmacia, medicamentos, consultas médicas)
            - education: Educación (cursos, libros, materiales de estudio)
            - leisure: Ocio (streaming, entretenimiento, juegos, salidas)
            - shopping: Compras personales (ropa, calzado, accesorios, tecnología/gadgets, cuidado personal)
            - home: Hogar (productos de limpieza, artículos de cocina, electrodomésticos menores, decoración)
            - other: Otro (solo si no encaja en ninguna de las anteriores)

            IMPORTANTE - Diferencia entre categorías:
            - "home" (Hogar): CIF, jabón líquido, escobas, ollas, sartenes, planchas, paños, ambientadores, focos
            - "shopping" (Compras personales): ropa, zapatos, perfumes, celulares, audífonos, relojes, carteras

            IMPORTANTE SOBRE LA FECHA:
            - HOY es %s. Estamos en el año %d.
            - NUNCA devuelvas un año anterior a 2024. Si ves "16" o "2016", es un error de lectura, el año correcto es %d.
            - La fecha DEBE tener formato YYYY-MM-DD con el año %d (ejemplo: %s).
            - Si el año no es claro, USA EL AÑO ACTUAL: %d.

            INSTRUCCIONES:
            1. Identifica el establecimiento/tienda (vendor)
            2. Extrae la fecha en formato YYYY-MM-DD con año de 4 dígitos. Si no es clara, usa: %s
            3. Lista cada producto con su precio
            4. Asigna la categoría más apropiada a cada item según las definiciones anteriores
            5. Calcula o extrae el total

            RESPONDE ÚNICAMENTE con JSON válido, sin markdown ni explicaciones:
            {"vendor":"nombre de tienda","date":"YYYY-MM-DD","items":[{"description":"producto","amount":0.00,"categoryId":"categoria"}],"total":0.00}
            """;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Procesa una imagen de boleta directamente con Gemini Vision.
     */
    public ProcessedReceipt processReceiptImage(MultipartFile imageFile) {
        log.info("Processing receipt image with Gemini Vision: {}", imageFile.getOriginalFilename());
        long startTime = System.currentTimeMillis();

        try {
            // Convert image to base64
            byte[] imageBytes = imageFile.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";

            LocalDate now = LocalDate.now();
            int currentYear = now.getYear();
            String today = now.toString();
            String prompt = String.format(VISION_PROMPT, today, currentYear, currentYear, currentYear, today, currentYear, today);

            // Build Gemini Vision request
            Map<String, Object> request = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of(
                            "inlineData", Map.of(
                                "mimeType", mimeType,
                                "data", base64Image
                            )
                        ),
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.1,
                    "maxOutputTokens", 4096
                )
            );

            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            String response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("Gemini Vision responded in {}ms", elapsed);

            if (response == null) {
                throw new OcrException("Empty response from Gemini");
            }

            return parseGeminiResponse(response);

        } catch (IOException e) {
            throw new OcrException("Error reading image file: " + e.getMessage(), e);
        } catch (Exception e) {
            if (e instanceof OcrException) {
                throw e;
            }
            log.error("Error calling Gemini Vision: {}", e.getMessage(), e);
            throw new OcrException("Error calling Gemini: " + e.getMessage(), e);
        }
    }

    private ProcessedReceipt parseGeminiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            // Check for error
            if (root.has("error")) {
                String errorMsg = root.path("error").path("message").asText("Unknown error");
                log.error("Gemini API error: {}", errorMsg);
                throw new OcrException("Gemini API error: " + errorMsg);
            }

            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                log.error("No candidates in Gemini response: {}", response);
                throw new OcrException("No candidates in Gemini response");
            }

            String text = candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            log.debug("Gemini raw text: {}", text);

            String jsonContent = extractJson(text);
            return objectMapper.readValue(jsonContent, ProcessedReceipt.class);

        } catch (JsonProcessingException e) {
            log.error("Failed to parse Gemini response: {}", response);
            throw new OcrException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }

    private String extractJson(String response) {
        // Remove markdown code blocks if present
        String cleaned = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');

        if (start == -1 || end == -1 || end < start) {
            throw new OcrException("No valid JSON found in Gemini response: " + response);
        }

        return cleaned.substring(start, end + 1);
    }
}
