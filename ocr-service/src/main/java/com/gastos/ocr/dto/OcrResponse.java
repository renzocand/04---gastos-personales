package com.gastos.ocr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrResponse {
    private String vendor;
    private LocalDate date;
    private List<ExtractedItem> items;
    private BigDecimal total;
    private String rawText;
    private long processingTimeMs;
    private List<String> savedExpenseIds;
}
