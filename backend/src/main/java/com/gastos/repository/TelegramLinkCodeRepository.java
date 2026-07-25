package com.gastos.repository;

import com.gastos.model.TelegramLinkCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface TelegramLinkCodeRepository extends JpaRepository<TelegramLinkCode, String> {

    Optional<TelegramLinkCode> findByCode(String code);

    Optional<TelegramLinkCode> findByUserDni(String dni);

    void deleteByUserDni(String dni);

    @Modifying
    @Query("DELETE FROM TelegramLinkCode c WHERE c.expiresAt < :now")
    void deleteExpired(Instant now);
}
