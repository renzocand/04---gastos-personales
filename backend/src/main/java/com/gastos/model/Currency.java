package com.gastos.model;

/**
 * Monedas soportadas. Sin conversión automática: cada gasto guarda su moneda
 * y los totales se agregan por separado (regla de negocio del proyecto).
 */
public enum Currency {
    PEN,
    USD
}
