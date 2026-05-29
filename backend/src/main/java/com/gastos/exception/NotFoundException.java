package com.gastos.exception;

/**
 * Se lanza cuando un recurso solicitado no existe. El GlobalExceptionHandler
 * la traduce a HTTP 404.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
