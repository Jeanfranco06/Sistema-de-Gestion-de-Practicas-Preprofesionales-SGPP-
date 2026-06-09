package edu.unt.ingenieria_industrial.sgpp.core.plan.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "plan_cronograma_actividad")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PlanCronogramaActividad extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private PlanGeneral plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_objetivo_especifico")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private PlanObjetivo objetivoEspecifico;

    @Column(name = "actividad", nullable = false, columnDefinition = "TEXT")
    private String actividad;

    @Column(name = "fecha_inicio_prevista")
    private LocalDate fechaInicioPrevista;

    @Column(name = "fecha_fin_prevista")
    private LocalDate fechaFinPrevista;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;
}
