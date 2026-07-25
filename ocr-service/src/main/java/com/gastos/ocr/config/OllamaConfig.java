package com.gastos.ocr.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class OllamaConfig {

    @Value("${gastos-backend.base-url}")
    private String gastosBackendUrl;

    @Bean
    public WebClient gastosBackendWebClient() {
        return WebClient.builder()
                .baseUrl(gastosBackendUrl)
                .build();
    }
}
