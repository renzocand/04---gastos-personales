package com.gastos.model;

/**
 * Origen del recibo/boleta. Indica cómo fue registrado en el sistema.
 */
public enum ReceiptSource {
    /** Ingresado manualmente por el usuario desde la web o app. */
    MANUAL,
    /** Recibido a través del bot de Telegram. */
    TELEGRAM,
    /** Procesado mediante OCR desde la interfaz web. */
    WEB_OCR
}
