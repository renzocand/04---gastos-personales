package com.gastos.ocr.controller;

import com.gastos.ocr.dto.OcrResponse;
import com.gastos.ocr.dto.ProcessedReceipt;
import com.gastos.ocr.service.ExpenseIntegrationService;
import com.gastos.ocr.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OcrController {

    private final GeminiService geminiService;
    private final ExpenseIntegrationService expenseIntegrationService;

    /**
     * Procesa una imagen de boleta con Gemini Vision.
     * Flujo simplificado: Imagen → Gemini → JSON estructurado
     */
    @PostMapping(value = "/process", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OcrResponse> processReceipt(@RequestParam("image") MultipartFile image) {
        log.info("Processing receipt image with Gemini Vision: {}", image.getOriginalFilename());
        long startTime = System.currentTimeMillis();

        // Gemini Vision procesa la imagen directamente
        ProcessedReceipt processedReceipt = geminiService.processReceiptImage(image);

        long processingTime = System.currentTimeMillis() - startTime;

        OcrResponse response = OcrResponse.builder()
                .vendor(processedReceipt.getVendor())
                .date(processedReceipt.getDate())
                .items(processedReceipt.getItems())
                .total(processedReceipt.getTotal())
                .processingTimeMs(processingTime)
                .build();

        log.info("Receipt processed successfully in {}ms", processingTime);
        return ResponseEntity.ok(response);
    }

    /**
     * Procesa imagen y guarda los gastos automáticamente.
     */
    @PostMapping(value = "/process-and-save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OcrResponse> processAndSaveReceipt(
            @RequestParam("image") MultipartFile image,
            @RequestHeader("Authorization") String authToken) {

        log.info("Processing and saving receipt: {}", image.getOriginalFilename());
        long startTime = System.currentTimeMillis();

        // Gemini Vision procesa la imagen
        ProcessedReceipt processedReceipt = geminiService.processReceiptImage(image);

        // Guardar gastos en el backend
        List<String> savedIds = expenseIntegrationService.saveExpenses(
                processedReceipt.getItems(),
                processedReceipt.getDate(),
                processedReceipt.getVendor(),
                authToken
        );

        long processingTime = System.currentTimeMillis() - startTime;

        OcrResponse response = OcrResponse.builder()
                .vendor(processedReceipt.getVendor())
                .date(processedReceipt.getDate())
                .items(processedReceipt.getItems())
                .total(processedReceipt.getTotal())
                .processingTimeMs(processingTime)
                .savedExpenseIds(savedIds)
                .build();

        log.info("Receipt processed and saved in {}ms, {} expenses", processingTime, savedIds.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OCR Service is running (Gemini Vision)");
    }
}
