package com.gastos.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gastos.dto.SettingsUpdateRequest;
import com.gastos.model.User;
import com.gastos.repository.UserRepository;
import com.gastos.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SettingsIntegrationTest {

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
        user.setDni("12345678");
        user.setPassword(passwordEncoder.encode("95862563"));
        user.setFirstName("Juan");
        user.setLastName("Perez");
        user.setRole("USER");

        userRepository.save(user);

        token = jwtService.generateToken(user.getDni());
    }

    @Test
    void shouldReturnDefaultSettingsWhenNotConfigured() throws Exception {

        mockMvc.perform(get("/api/settings")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())

                .andExpect(jsonPath("$.monthlyIncome").doesNotExist())
                .andExpect(jsonPath("$.alertsEnabled").value(true))
                .andExpect(jsonPath("$.highContrast").value(false))
                .andExpect(jsonPath("$.fontScale").value("normal"))
                .andExpect(jsonPath("$.reduceMotion").value(false));
    }

    @Test
    void shouldCreateOrUpdateSettings() throws Exception {
        SettingsUpdateRequest request = new SettingsUpdateRequest(
                new BigDecimal("2500.00"),
                true,
                true,
                "large",
                false
        );

        mockMvc.perform(put("/api/settings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())

                .andExpect(jsonPath("$.monthlyIncome").value(2500.00))
                .andExpect(jsonPath("$.alertsEnabled").value(true))
                .andExpect(jsonPath("$.highContrast").value(true))
                .andExpect(jsonPath("$.fontScale").value("large"))
                .andExpect(jsonPath("$.reduceMotion").value(false));
    }

    @Test
    void shouldUpdateExistingSettings() throws Exception {
        mockMvc.perform(put("/api/settings")
                .header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON)
                .content("""
                {
                  "monthlyIncome": 1000,
                  "alertsEnabled": true,
                  "highContrast": false,
                  "fontScale": "normal",
                  "reduceMotion": false
                }
                """));

        mockMvc.perform(put("/api/settings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("""
                        {
                          "monthlyIncome": 3000,
                          "alertsEnabled": false,
                          "highContrast": true,
                          "fontScale": "xlarge",
                          "reduceMotion": true
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyIncome").value(3000))
                .andExpect(jsonPath("$.fontScale").value("xlarge"));
    }
}