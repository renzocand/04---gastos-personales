package com.gastos.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.gastos.dto.CategoryResponse;
import com.gastos.dto.ExpenseRequest;
import com.gastos.dto.ExpenseResponse;
import com.gastos.model.Category;
import com.gastos.model.Currency;
import com.gastos.model.Expense;
import com.gastos.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Pruebas del mapeo entidad ↔ DTO. Respaldan TC-17 / PA-26..PA-28. El mapper no
 * tiene dependencias: es conversión pura, así que se instancia directamente.
 */
class ExpenseMapperTest {

    private final ExpenseMapper mapper = new ExpenseMapper();

    // ---- TC-17 / PA-26: Expense -> ExpenseResponse (aplana categoryId) ----

    @Test
    @DisplayName("TC-17 / PA-26: toResponse(Expense) copia los campos y aplana category.id")
    void tc17_pa26_toResponse_expense() {
        Category cat = new Category();
        cat.setId("cat-1");
        cat.setName("Comida");

        Instant created = Instant.parse("2026-06-01T10:00:00Z");
        Instant updated = Instant.parse("2026-06-02T12:30:00Z");
        Expense e = new Expense();
        e.setId("exp-1");
        e.setAmount(new BigDecimal("99.90"));
        e.setCurrency(Currency.PEN);
        e.setDescription("Cena");
        e.setCategory(cat);
        e.setDate(LocalDate.of(2026, 6, 1));
        e.setCreatedAt(created);
        e.setUpdatedAt(updated);

        ExpenseResponse res = mapper.toResponse(e);

        assertThat(res.id()).isEqualTo("exp-1");
        assertThat(res.amount()).isEqualByComparingTo("99.90");
        assertThat(res.currency()).isEqualTo(Currency.PEN);
        assertThat(res.description()).isEqualTo("Cena");
        assertThat(res.categoryId()).isEqualTo("cat-1");
        assertThat(res.date()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(res.createdAt()).isEqualTo(created);
        assertThat(res.updatedAt()).isEqualTo(updated);
    }

    // ---- TC-17 / PA-27: ExpenseRequest + Category + User -> Expense ----

    @Test
    @DisplayName("TC-17 / PA-27: toEntity copia los campos del request y asigna categoría y dueño")
    void tc17_pa27_toEntity() {
        ExpenseRequest req = new ExpenseRequest(
                new BigDecimal("50.00"), Currency.USD, "Taxi", "cat-1", LocalDate.of(2026, 6, 3));
        Category category = new Category();
        category.setId("cat-1");
        User user = new User();
        user.setDni("12345678");

        Expense e = mapper.toEntity(req, category, user);

        assertThat(e.getAmount()).isEqualByComparingTo("50.00");
        assertThat(e.getCurrency()).isEqualTo(Currency.USD);
        assertThat(e.getDescription()).isEqualTo("Taxi");
        assertThat(e.getDate()).isEqualTo(LocalDate.of(2026, 6, 3));
        assertThat(e.getCategory()).isSameAs(category);
        assertThat(e.getUser()).isSameAs(user);
    }

    // ---- TC-17 / PA-28: Category -> CategoryResponse ----

    @Test
    @DisplayName("TC-17 / PA-28: toResponse(Category) mapea id, name, icon y description")
    void tc17_pa28_toResponse_category() {
        Category category = new Category();
        category.setId("food");
        category.setName("Comida");
        category.setIcon("🍔");
        category.setDescription("Gastos de alimentación");

        CategoryResponse res = mapper.toResponse(category);

        assertThat(res.id()).isEqualTo("food");
        assertThat(res.name()).isEqualTo(category.getName());
        assertThat(res.icon()).isEqualTo("🍔");
        assertThat(res.description()).isEqualTo("Gastos de alimentación");
    }
}
