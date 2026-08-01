package com.gastos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.gastos.dto.ExpenseRequest;
import com.gastos.dto.ExpenseResponse;
import com.gastos.dto.ExpenseUpdateRequest;
import com.gastos.exception.NotFoundException;
import com.gastos.i18n.Messages;
import com.gastos.mapper.ExpenseMapper;
import com.gastos.model.Currency;
import com.gastos.model.Expense;
import com.gastos.model.User;
import com.gastos.model.UserCategory;
import com.gastos.repository.ExpenseRepository;
import com.gastos.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Pruebas de la lógica de negocio de gastos. Respaldan los casos de prueba
 * funcionales TC-01..TC-05 y las pruebas de aceptación PA-01, PA-04..PA-07, PA-09.
 * Son unitarias puras: los repositorios y el mapper se simulan con Mockito.
 */
@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    private static final String DNI = "12345678";

    @Mock private ExpenseRepository expenseRepository;
    @Mock private UserCategoryService userCategoryService;
    @Mock private UserRepository userRepository;
    @Mock private ExpenseMapper mapper;
    @Mock private Messages messages;

    @InjectMocks private ExpenseService service;

    private User user() {
        User u = new User();
        u.setId("user-1");
        u.setDni(DNI);
        return u;
    }

    private UserCategory category(String id) {
        UserCategory c = new UserCategory();
        c.setId(id);
        c.setName(id);
        c.setUser(user());
        return c;
    }

    private Expense expense(BigDecimal amount, Currency currency, String description) {
        Expense e = new Expense();
        e.setAmount(amount);
        e.setCurrency(currency);
        e.setDescription(description);
        e.setCategory(category("food"));
        e.setUser(user());
        e.setDate(LocalDate.of(2026, 6, 1));
        return e;
    }

    private ExpenseResponse anyResponse() {
        return new ExpenseResponse("id", Currency.PEN, BigDecimal.TEN, "desc", "food",
                LocalDate.of(2026, 6, 1), null, null);
    }

    // ---- TC-01 / PA-01: Registrar gasto ----

    @Test
    @DisplayName("TC-01 / PA-01: create persiste el gasto con usuario y categoría resueltos")
    void tc01_pa01_create_ok() {
        ExpenseRequest req = new ExpenseRequest(new BigDecimal("50.00"), Currency.PEN,
                "Almuerzo", "food", LocalDate.of(2026, 6, 1));
        User user = user();
        UserCategory category = category("food");
        Expense entity = expense(req.amount(), req.currency(), req.description());
        ExpenseResponse response = anyResponse();

        when(userRepository.findByDni(DNI)).thenReturn(Optional.of(user));
        when(userCategoryService.requireOwnedCategory(user.getId(), "food")).thenReturn(category);
        when(mapper.toEntity(req, category, user)).thenReturn(entity);
        when(expenseRepository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        ExpenseResponse result = service.create(DNI, req);

        assertThat(result).isSameAs(response);
        verify(expenseRepository).save(entity);
    }

    @Test
    @DisplayName("TC-01: create con categoría inexistente lanza NotFoundException")
    void tc01_create_categoryNotFound() {
        ExpenseRequest req = new ExpenseRequest(new BigDecimal("50.00"), Currency.PEN,
                "Almuerzo", "ghost", LocalDate.of(2026, 6, 1));
        User user = user();
        when(userRepository.findByDni(DNI)).thenReturn(Optional.of(user));
        when(userCategoryService.requireOwnedCategory(user.getId(), "ghost"))
                .thenThrow(new NotFoundException("Categoría no encontrada"));

        assertThatThrownBy(() -> service.create(DNI, req)).isInstanceOf(NotFoundException.class);
        verify(expenseRepository, never()).save(any());
    }

    // ---- TC-02 / PA-04: Consultar gastos ----

    @Test
    @DisplayName("TC-02 / PA-04: findAll devuelve la lista del usuario")
    void tc02_pa04_findAll_list() {
        Expense a = expense(new BigDecimal("10"), Currency.PEN, "a");
        Expense b = expense(new BigDecimal("20"), Currency.PEN, "b");
        when(expenseRepository.findFiltered(DNI, null, null, null, null)).thenReturn(List.of(a, b));
        when(mapper.toResponse(any(Expense.class))).thenReturn(anyResponse());

        List<ExpenseResponse> result = service.findAll(DNI, null, null, null, null);

        assertThat(result).hasSize(2);
    }

    // ---- TC-03 / PA-05, PA-06: Filtrar gastos ----

    @Test
    @DisplayName("TC-03 / PA-05: findAll delega los filtros al repositorio")
    void tc03_pa05_findAll_withFilters() {
        LocalDate from = LocalDate.of(2026, 6, 1);
        LocalDate to = LocalDate.of(2026, 6, 30);
        when(expenseRepository.findFiltered(DNI, "food", Currency.USD, from, to))
                .thenReturn(List.of(expense(new BigDecimal("5"), Currency.USD, "x")));
        when(mapper.toResponse(any(Expense.class))).thenReturn(anyResponse());

        List<ExpenseResponse> result = service.findAll(DNI, "food", Currency.USD, from, to);

        assertThat(result).hasSize(1);
        verify(expenseRepository).findFiltered(DNI, "food", Currency.USD, from, to);
    }

    @Test
    @DisplayName("TC-03 / PA-06: findAll sin coincidencias devuelve lista vacía")
    void tc03_pa06_findAll_empty() {
        when(expenseRepository.findFiltered(DNI, "ghost", null, null, null)).thenReturn(List.of());

        assertThat(service.findAll(DNI, "ghost", null, null, null)).isEmpty();
    }

    // ---- TC-04 / PA-07: Editar gasto ----

    @Test
    @DisplayName("TC-04 / PA-07: update aplica solo los campos no-null")
    void tc04_pa07_update_onlyNonNullFields() {
        Expense existing = expense(new BigDecimal("100.00"), Currency.PEN, "Original");
        when(expenseRepository.findByIdAndUser_Dni("e1", DNI)).thenReturn(Optional.of(existing));
        when(mapper.toResponse(existing)).thenReturn(anyResponse());

        // Solo cambia descripción y monto; currency/date/categoryId llegan null.
        ExpenseUpdateRequest req = new ExpenseUpdateRequest(
                new BigDecimal("250.00"), null, "Editado", null, null);

        service.update(DNI, "e1", req);

        assertThat(existing.getAmount()).isEqualByComparingTo("250.00");
        assertThat(existing.getDescription()).isEqualTo("Editado");
        assertThat(existing.getCurrency()).isEqualTo(Currency.PEN);       // sin cambio
        assertThat(existing.getDate()).isEqualTo(LocalDate.of(2026, 6, 1)); // sin cambio
    }

    @Test
    @DisplayName("TC-04: update de un gasto ajeno lanza NotFoundException (multi-tenancy)")
    void tc04_update_foreignExpense_notFound() {
        when(expenseRepository.findByIdAndUser_Dni("e1", DNI)).thenReturn(Optional.empty());
        when(messages.get(anyString(), any())).thenReturn("Gasto no encontrado");

        ExpenseUpdateRequest req = new ExpenseUpdateRequest(null, null, "x", null, null);

        assertThatThrownBy(() -> service.update(DNI, "e1", req)).isInstanceOf(NotFoundException.class);
    }

    // ---- TC-05 / PA-09: Eliminar gasto ----

    @Test
    @DisplayName("TC-05 / PA-09: delete de gasto propio lo elimina")
    void tc05_pa09_delete_own() {
        Expense existing = expense(new BigDecimal("10"), Currency.PEN, "x");
        when(expenseRepository.findByIdAndUser_Dni("e1", DNI)).thenReturn(Optional.of(existing));

        service.delete(DNI, "e1");

        verify(expenseRepository).delete(existing);
    }

    @Test
    @DisplayName("TC-05: delete de gasto ajeno lanza NotFoundException")
    void tc05_delete_foreign_notFound() {
        when(expenseRepository.findByIdAndUser_Dni("e1", DNI)).thenReturn(Optional.empty());
        when(messages.get(anyString(), any())).thenReturn("Gasto no encontrado");

        assertThatThrownBy(() -> service.delete(DNI, "e1")).isInstanceOf(NotFoundException.class);
        verify(expenseRepository, never()).delete(any());
    }
}
