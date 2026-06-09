package edu.unt.ingenieria_industrial.sgpp.core.plazo.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "control_plazo")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ControlPlazo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Expediente expediente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_regla_plazo", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private ReglaPlazo reglaPlazo;

    @Column(name = "id_plan")
    private Long idPlan;

    @Column(name = "id_documento")
    private Long idDocumento;

    @Column(name = "fecha_base", nullable = false)
    private LocalDate fechaBase;

    @Column(name = "fecha_limite", nullable = false)
    private LocalDate fechaLimite;

    @Column(name = "fecha_cumplimiento")
    private LocalDateTime fechaCumplimiento;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "VIGENTE";

    @Column(name = "cumplido_en_plazo")
    private Boolean cumplidoEnPlazo;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;
}
