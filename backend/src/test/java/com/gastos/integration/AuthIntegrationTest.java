package com.gastos.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gastos.dto.LoginRequest;
import com.gastos.dto.RegisterRequest;
import com.gastos.model.User;
import com.gastos.repository.UserRepository;
import com.gastos.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {
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

    @Test
    void shouldRegisterUser() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "75256256",
                "95862563",
                "Juan",
                "Perez",
                "Gomez",
                "juan@gmail.com"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.dni").value("75256256"));

        User user = userRepository.findByDni("75256256")
                .orElse(null);

        assertThat(user).isNotNull();
        assertThat(user.getFirstName()).isEqualTo("Juan");
        assertThat(user.getLastName()).isEqualTo("Perez");
        assertThat(user.getEmail()).isEqualTo("juan@gmail.com");
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        User user = new User();
        user.setDni("75256256");
        user.setPassword(passwordEncoder.encode("95862563"));
        user.setFirstName("Juan");
        user.setLastName("Perez");
        user.setRole("USER");

        userRepository.save(user);

        LoginRequest request =
                new LoginRequest("75256256", "95862563");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.dni").value("75256256"));
    }

    @Test
    void shouldReturnAuthenticatedUser() throws Exception {
        User user = new User();
        user.setDni("75256256");
        user.setPassword(passwordEncoder.encode("95862563"));
        user.setFirstName("Juan");
        user.setLastName("Perez");
        user.setSecondLastName("Gomez");
        user.setEmail("juan@gmail.com");
        user.setRole("USER");

        userRepository.save(user);

        String token = jwtService.generateToken(user.getDni());

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization",
                                "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dni")
                        .value("75256256"))
                .andExpect(jsonPath("$.firstName")
                        .value("Juan"))
                .andExpect(jsonPath("$.lastName")
                        .value("Perez"));
    }
}