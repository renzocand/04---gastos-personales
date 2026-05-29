package com.gastos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la API REST de gastos personales.
 */
@SpringBootApplication
public class GastosApplication {

    public static void main(String[] args) {
        SpringApplication.run(GastosApplication.class, args);
    }
}
