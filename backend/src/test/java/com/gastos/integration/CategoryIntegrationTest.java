package com.gastos.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class CategoryIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnSeededCategoriesOrderedBySortOrder() throws Exception {

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(9)))

                // orden validado por posición
                .andExpect(jsonPath("$[0].id").value("food"))
                .andExpect(jsonPath("$[1].id").value("transport"))
                .andExpect(jsonPath("$[2].id").value("housing"));
    }
}