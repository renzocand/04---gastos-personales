package com.gastos.ocr.service;

import com.gastos.ocr.dto.ExtractedItem;
import com.gastos.ocr.exception.OcrException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseIntegrationService {

    private final WebClient gastosBackendWebClient;

    public List<String> saveExpenses(List<ExtractedItem> items, LocalDate date, String vendor, String authToken) {
        List<String> savedIds = new ArrayList<>();

        for (ExtractedItem item : items) {
            try {
                String expenseId = saveExpense(item, date, vendor, authToken);
                if (expenseId != null) {
                    savedIds.add(expenseId);
                }
            } catch (Exception e) {
                log.error("Failed to save expense for item: {}", item.getDescription(), e);
            }
        }

        log.info("Saved {} out of {} expenses to backend", savedIds.size(), items.size());
        return savedIds;
    }

    private String saveExpense(ExtractedItem item, LocalDate date, String vendor, String authToken) {
        Map<String, Object> expenseRequest = new HashMap<>();
        expenseRequest.put("description", item.getDescription() + " - " + vendor);
        expenseRequest.put("amount", item.getAmount());
        expenseRequest.put("categoryId", mapCategoryId(item.getCategoryId()));
        expenseRequest.put("date", date.toString());

        try {
            Map<String, Object> response = gastosBackendWebClient.post()
                    .uri("/api/expenses")
                    .header(HttpHeaders.AUTHORIZATION, authToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(expenseRequest)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("id")) {
                return response.get("id").toString();
            }

            return null;

        } catch (WebClientResponseException e) {
            log.error("Backend returned error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new OcrException("Failed to save expense: " + e.getMessage(), e);
        }
    }

    private String mapCategoryId(String categoryId) {
        // Map our category IDs to backend category IDs
        // This might need adjustment based on actual backend category structure
        return switch (categoryId) {
            case "food" -> "food";
            case "transport" -> "transport";
            case "housing" -> "housing";
            case "services" -> "services";
            case "health" -> "health";
            case "education" -> "education";
            case "leisure" -> "leisure";
            case "shopping" -> "shopping";
            default -> "other";
        };
    }
}
