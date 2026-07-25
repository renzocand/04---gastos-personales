package com.gastos.exception;

/**
 * Se lanza cuando una petición tiene datos inválidos o no cumple
 * con las reglas de negocio. El GlobalExceptionHandler la traduce a HTTP 400.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
