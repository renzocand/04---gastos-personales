package com.gastos.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gastos.dto.ExpenseRequest;
import com.gastos.model.Currency;
import com.gastos.model.User;
import com.gastos.repository.*;
import com.gastos.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExpenseIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String token;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setDni("75256256");
        user.setPassword(passwordEncoder.encode("95862563"));
        user.setFirstName("Juan");
        user.setLastName("Perez");
        user.setRole("USER");

        userRepository.save(user);

        token = jwtService.generateToken(user.getDni());
    }

    @Test
    void shouldCreateExpense() throws Exception {
        ExpenseRequest request = new ExpenseRequest(
                new java.math.BigDecimal("25.50"),
                Currency.PEN,
                "Lunch",
                "food",
                LocalDate.now()
        );

        mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value("Lunch"))
                .andExpect(jsonPath("$.categoryId").value("food"));
    }

    @Test
    void shouldListExpenses() throws Exception {
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldUpdateExpensePartially() throws Exception {
        // crear primero
        String response = mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("""
                        {
                          "amount": 10,
                          "currency": "PEN",
                          "description": "Coffee",
                          "categoryId": "food",
                          "date": "2026-01-01"
                        }
                        """))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        // update parcial
        mockMvc.perform(patch("/api/expenses/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("""
                        {
                          "amount": 99.99,
                          "description": "Updated Coffee"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(99.99))
                .andExpect(jsonPath("$.description").value("Updated Coffee"));
    }

    @Test
    void shouldDeleteExpense() throws Exception {
        String response = mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("""
                        {
                          "amount": 10,
                          "currency": "PEN",
                          "description": "To delete",
                          "categoryId": "food",
                          "date": "2026-01-01"
                        }
                        """))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(delete("/api/expenses/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}