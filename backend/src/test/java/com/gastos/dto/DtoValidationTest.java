package com.gastos.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import com.gastos.model.Currency;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Pruebas de las validaciones declarativas (Bean Validation) de los DTOs de
 * entrada. Respaldan las pruebas de aceptación de validación: PA-02 (campos
 * obligatorios), PA-03 (monto mayor a cero), PA-08 (datos inválidos al editar)
 * y PA-13 (ingreso/escala inválidos). No requieren Spring.
 */
class DtoValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private static Set<String> invalidProps(Object dto) {
        return validator.validate(dto).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toSet());
    }

    // ---- PA-02: campos obligatorios al registrar un gasto ----

    @Test
    @DisplayName("PA-02: ExpenseRequest con todo nulo viola los 5 campos obligatorios")
    void pa02_expenseRequest_requiredFields() {
        ExpenseRequest req = new ExpenseRequest(null, null, null, null, null);

        assertThat(invalidProps(req))
                .contains("amount", "currency", "description", "categoryId", "date");
    }

    // ---- PA-03: monto mayor a cero ----

    @Test
    @DisplayName("PA-03: ExpenseRequest con monto 0 viola el mínimo; con monto válido no")
    void pa03_expenseRequest_amountMin() {
        LocalDate date = LocalDate.of(2026, 6, 1);
        ExpenseRequest zero = new ExpenseRequest(BigDecimal.ZERO, Currency.PEN, "Café", "food", date);
        ExpenseRequest ok = new ExpenseRequest(new BigDecimal("10.00"), Currency.PEN, "Café", "food", date);

        assertThat(invalidProps(zero)).contains("amount");
        assertThat(validator.validate(ok)).isEmpty();
    }

    // ---- PA-08: datos inválidos al editar ----

    @Test
    @DisplayName("PA-08: ExpenseUpdateRequest inválido (monto<0.1, descripción>80) viola; todo null es válido")
    void pa08_expenseUpdateRequest_invalidData() {
        ExpenseUpdateRequest invalid = new ExpenseUpdateRequest(
                new BigDecimal("0.05"), null, "x".repeat(81), null, null);
        ExpenseUpdateRequest allNull = new ExpenseUpdateRequest(null, null, null, null, null);

        assertThat(invalidProps(invalid)).contains("amount", "description");
        assertThat(validator.validate(allNull)).isEmpty(); // actualización parcial: todo opcional
    }

    // ---- PA-13: ingreso / escala inválidos ----

    @Test
    @DisplayName("PA-13: SettingsUpdateRequest con ingreso negativo y fontScale inválido viola; válido no")
    void pa13_settingsUpdateRequest_invalidIncomeAndFontScale() {
        SettingsUpdateRequest invalid = new SettingsUpdateRequest(
                new BigDecimal("-1"), true, false, "huge", false);
        SettingsUpdateRequest ok = new SettingsUpdateRequest(
                new BigDecimal("3000.00"), true, false, "large", false);

        assertThat(invalidProps(invalid)).contains("monthlyIncome", "fontScale");
        assertThat(validator.validate(ok)).isEmpty();
    }
}
