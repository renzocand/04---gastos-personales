package com.gastos.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class ExchangeRateIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnExchangeRate() throws Exception {

        mockMvc.perform(get("/api/exchange-rate"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.rate").exists())
                .andExpect(jsonPath("$.rate").isNumber());
    }
}