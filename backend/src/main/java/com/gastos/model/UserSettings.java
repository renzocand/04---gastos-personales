package com.gastos.model;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Preferencias/configuración de un usuario, separadas de su identidad (User)
 * para no mezclar datos de auth con ajustes. Relación 1:1: la PK de esta tabla
 * es la misma que la del usuario (@MapsId), así cada usuario tiene como mucho
 * una fila de settings.
 *
 * Por ahora guarda el ingreso mensual de referencia (en PEN) que usa la app
 * para calcular cuánto lleva gastado el usuario en el mes y avisarle. No es
 * contabilidad: es un único número editable, no transacciones de ingreso.
 */
@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
public class UserSettings {

    /** Igual al id del usuario (clave compartida vía @MapsId). */
    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    /** Ingreso mensual de referencia en PEN. Null si el usuario no lo configuró. */
    @Column(name = "monthly_income", precision = 12, scale = 2)
    private BigDecimal monthlyIncome;

    /** Si el usuario quiere recibir avisos al acercarse/superar su ingreso. */
    @Column(name = "alerts_enabled", nullable = false)
    private boolean alertsEnabled = true;

    // ===== Accesibilidad (ODS 10 · meta 10.2: inclusión de personas con discapacidad) =====

    /** Tema de alto contraste para baja visión / daltonismo. */
    @Column(name = "high_contrast", nullable = false)
    private boolean highContrast = false;

    /** Escala tipográfica de la interfaz: "normal" | "large" | "xlarge". */
    @Column(name = "font_scale", length = 10, nullable = false)
    private String fontScale = "normal";

    /** Reduce/desactiva animaciones y transiciones (sensibilidad al movimiento). */
    @Column(name = "reduce_motion", nullable = false)
    private boolean reduceMotion = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public UserSettings(User user) {
        this.user = user;
    }
}
