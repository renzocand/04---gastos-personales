package com.gastos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.gastos.dto.CategoryResponse;
import com.gastos.mapper.ExpenseMapper;
import com.gastos.model.Category;
import com.gastos.repository.CategoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

/**
 * Pruebas del catálogo de categorías. Respaldan TC-16 / PA-25 (listar categorías
 * ordenadas por sortOrder). Unitarias puras: repositorio y mapper simulados.
 */
@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private ExpenseMapper mapper;

    @InjectMocks private CategoryService service;

    private Category category(String id, String name) {
        Category c = new Category();
        c.setId(id);
        c.setName(name);
        return c;
    }

    // ---- TC-16 / PA-25: Listar categorías ----

    @Test
    @DisplayName("TC-16 / PA-25: findAll mapea las categorías ordenadas por sortOrder")
    void tc16_pa25_findAll_ok() {
        Category food = category("food", "Comida");
        Category transport = category("transport", "Transporte");
        CategoryResponse foodRes = new CategoryResponse("food", "Comida", "🍔", "Alimentación");
        CategoryResponse transportRes = new CategoryResponse("transport", "Transporte", "🚌", "Movilidad");

        when(categoryRepository.findAll(Sort.by("sortOrder"))).thenReturn(List.of(food, transport));
        when(mapper.toResponse(food)).thenReturn(foodRes);
        when(mapper.toResponse(transport)).thenReturn(transportRes);

        List<CategoryResponse> res = service.findAll();

        assertThat(res).hasSize(2).containsExactly(foodRes, transportRes);
        verify(categoryRepository).findAll(Sort.by("sortOrder"));
    }

    @Test
    @DisplayName("TC-16: findAll sin categorías devuelve lista vacía")
    void tc16_findAll_empty() {
        when(categoryRepository.findAll(Sort.by("sortOrder"))).thenReturn(List.of());

        assertThat(service.findAll()).isEmpty();
    }
}
