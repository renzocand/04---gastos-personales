package com.gastos.i18n;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

/**
 * Acceso simple a los mensajes traducidos usando el locale del request actual
 * (resuelto por el {@code LocaleResolver} a partir de {@code Accept-Language}).
 * Lo usan los services y el handler de excepciones para devolver texto en el
 * idioma del usuario.
 */
@Component
public class Messages {

    private final MessageSource messageSource;

    public Messages(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /** Resuelve {@code code} con sus argumentos en el idioma del request. */
    public String get(String code, Object... args) {
        return messageSource.getMessage(code, args, LocaleContextHolder.getLocale());
    }
}
