package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Nota por unidad para prácticas iniciales (curriculares).
 *
 * Estructura según reglamento de Ingeniería Industrial UNT:
 * - Unidad 1: Plan de Práctica (20%) + Informe Parcial (80%)
 * - Unidad 2: Informe Parcial
 * - Unidad 3: Informe Final
 */
@Data
@Entity
@Table(name = "nota_unidad")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NotaUnidad extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Expediente expediente;

    @Column(name = "numero_unidad", nullable = false)
    private Integer numeroUnidad;

    @Column(name = "nota_plan", precision = 4, scale = 2)
    private BigDecimal notaPlan;

    @Column(name = "nota_informe", precision = 4, scale = 2)
    private BigDecimal notaInforme;

    @Column(name = "nota_final_unidad", precision = 4, scale = 2, nullable = false)
    private BigDecimal notaFinalUnidad;

    @Column(name = "porcentaje_plan")
    private Integer porcentajePlan;

    @Column(name = "porcentaje_informe")
    private Integer porcentajeInforme;

    @Column(name = "comentarios", columnDefinition = "TEXT")
    private String comentarios;

    @Column(name = "fecha_evaluacion", nullable = false)
    private LocalDate fechaEvaluacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evaluador", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario evaluador;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
