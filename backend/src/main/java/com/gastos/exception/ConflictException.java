package com.gastos.exception;

/**
 * Se lanza cuando una operación choca con el estado actual (ej. registrar un DNI
 * que ya existe). El GlobalExceptionHandler la traduce a HTTP 409.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
