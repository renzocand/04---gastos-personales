package com.gastos.controller;

import com.gastos.dto.ExchangeRateResponse;
import com.gastos.service.ExchangeRateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expone el tipo de cambio que el frontend usa para convertir USD a PEN.
 * Protegido por JWT como el resto de /api/** (lo consume el dashboard).
 */
@RestController
@RequestMapping("/api/exchange-rate")
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    public ExchangeRateController(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    /** GET /api/exchange-rate → { "rate": <USD a PEN> }. */
    @GetMapping
    public ExchangeRateResponse get() {
        return new ExchangeRateResponse(exchangeRateService.getUsdToPen());
    }
}
