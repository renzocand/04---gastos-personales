package com.gastos.config;

import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.validation.Validator;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

/**
 * Internacionalización del backend. El idioma de cada respuesta se decide por el
 * header {@code Accept-Language} que envía el frontend (es / en / qu, con es por
 * defecto). Los mensajes viven en {@code classpath:i18n/messages*.properties} y se
 * usan tanto para las validaciones de Bean Validation (claves {@code {clave}} en
 * los DTOs) como para los mensajes de error del dominio.
 */
@Configuration
public class I18nConfig implements WebMvcConfigurer {

    private static final List<Locale> SUPPORTED =
            List.of(new Locale("es"), new Locale("en"), new Locale("qu"));

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource ms = new ReloadableResourceBundleMessageSource();
        ms.setBasename("classpath:i18n/messages");
        ms.setDefaultEncoding("UTF-8");
        // Sin fallback al locale del sistema operativo: el respaldo es messages.properties (español).
        ms.setFallbackToSystemLocale(false);
        return ms;
    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(SUPPORTED);
        resolver.setDefaultLocale(new Locale("es"));
        return resolver;
    }

    /**
     * Hace que las validaciones de @Valid resuelvan sus mensajes {@code {clave}}
     * contra nuestro MessageSource, usando el locale del request.
     */
    @Override
    public Validator getValidator() {
        LocalValidatorFactoryBean factory = new LocalValidatorFactoryBean();
        factory.setValidationMessageSource(messageSource());
        return factory;
    }
}
