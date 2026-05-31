package com.gastos.config;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.gastos.model.Category;
import com.gastos.model.Currency;
import com.gastos.model.Expense;
import com.gastos.model.User;
import com.gastos.repository.CategoryRepository;
import com.gastos.repository.ExpenseRepository;
import com.gastos.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Siembra datos de demostración al arrancar: un usuario de prueba y algunos
 * gastos suyos. Es idempotente (solo actúa si el usuario demo aún no existe),
 * así que reiniciar la app no duplica nada.
 *
 * Credenciales demo → DNI: 00000000 / contraseña: demo1234
 *
 * Reemplaza al antiguo seed de gastos en data.sql, que ya no es viable porque
 * cada gasto necesita un user_id válido y la contraseña debe ir hasheada.
 */
@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final String DEMO_DNI = "00000000";

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository,
                          ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByDni(DEMO_DNI)) {
            return;
        }

        User demo = new User();
        demo.setDni(DEMO_DNI);
        demo.setPassword(passwordEncoder.encode("demo1234"));
        demo.setFirstName("Usuario");
        demo.setLastName("Demo");
        demo.setRole("USER");
        userRepository.save(demo);

        seed(demo, "158.40", Currency.PEN, "Wong San Isidro",    "food",      "2026-04-19");
        seed(demo,  "22.00", Currency.PEN, "Uber a Miraflores",  "transport", "2026-04-19");
        seed(demo,  "15.99", Currency.USD, "Netflix",            "leisure",   "2026-04-18");
        seed(demo,  "18.00", Currency.PEN, "Menu del dia",       "food",      "2026-04-18");
        seed(demo,  "10.99", Currency.USD, "Spotify",            "leisure",   "2026-04-17");
        seed(demo,  "65.00", Currency.PEN, "Taxi aeropuerto",    "transport", "2026-04-15");
        seed(demo,  "42.50", Currency.PEN, "Farmacia Inkafarma", "other",     "2026-04-15");
        seed(demo,  "28.00", Currency.PEN, "Cineplanet",         "leisure",   "2026-04-14");
    }

    private void seed(User owner, String amount, Currency currency, String description,
                      String categoryId, String date) {
        Category category = categoryRepository.findById(categoryId).orElseThrow();
        Expense e = new Expense();
        e.setAmount(new BigDecimal(amount));
        e.setCurrency(currency);
        e.setDescription(description);
        e.setCategory(category);
        e.setUser(owner);
        e.setDate(LocalDate.parse(date));
        expenseRepository.save(e);
    }
}
