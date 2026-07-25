package com.gastos.repository;

import com.gastos.model.TelegramLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TelegramLinkRepository extends JpaRepository<TelegramLink, String> {

    Optional<TelegramLink> findByTelegramId(Long telegramId);

    List<TelegramLink> findByUserId(String userId);

    List<TelegramLink> findByUserDni(String dni);

    boolean existsByTelegramId(Long telegramId);

    void deleteByTelegramId(Long telegramId);
}
