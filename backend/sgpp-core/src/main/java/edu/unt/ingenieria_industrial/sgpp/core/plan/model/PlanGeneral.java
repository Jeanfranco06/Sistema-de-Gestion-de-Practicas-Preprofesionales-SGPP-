package edu.unt.ingenieria_industrial.sgpp.core.plan.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "plan_general")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PlanGeneral extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Expediente expediente;

    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "BORRADOR";

    @Column(name = "fecha_presentacion")
    private LocalDateTime fechaPresentacion;

    @Column(name = "fecha_ultima_revision")
    private LocalDateTime fechaUltimaRevision;

    @Column(name = "observacion_general", columnDefinition = "TEXT")
    private String observacionGeneral;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PlanSeccion> secciones = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PlanObjetivo> objetivos = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PlanCronogramaActividad> cronograma = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PlanObservacion> observaciones = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PlanHistorialEstado> historialEstados = new ArrayList<>();
}
