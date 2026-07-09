package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Componente de evaluación según normativa UNT 2025.
 * 
 * La evaluación de prácticas se divide en tres componentes:
 * - PLAN: Plan de Prácticas (Docente Asesor) - 10 puntos (10%)
 * - EMPRESA: Evaluación de empresa (Tutor Externo) - 50 puntos (50%)
 * - INFORME: Informe Final (Comité) - 40 puntos (40%)
 */
@Data
@Entity
@Table(name = "componente_evaluacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ComponenteEvaluacion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente", nullable = false)
    private Expediente expediente;

    @Column(name = "tipo_componente", length = 20, nullable = false)
    private String tipoComponente; // PLAN, EMPRESA, INFORME

    @Column(name = "puntaje_maximo", nullable = false)
    @Builder.Default
    private Integer puntajeMaximo = 100;

    @Column(name = "puntaje_obtenido")
    private Integer puntajeObtenido;

    @Column(name = "porcentaje", nullable = false)
    @Builder.Default
    private Integer porcentaje = 100;

    @Column(name = "evaluador_id")
    private Long evaluadorId;

    @Column(name = "tipo_evaluador", length = 50)
    private String tipoEvaluador; // DOCENTE_ASESOR, TUTOR_EXTERNO, COMITE

    @Column(name = "fecha_evaluacion")
    private java.time.LocalDate fechaEvaluacion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "estado", length = 20, nullable = false)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE, COMPLETADO, OBSERVADO

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
