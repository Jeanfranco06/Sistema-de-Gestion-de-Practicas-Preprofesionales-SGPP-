package edu.unt.ingenieria_industrial.sgpp.core.plan.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "plan_observacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PlanObservacion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private PlanGeneral plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_origen", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Usuario usuarioOrigen;

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tipo", length = 20)
    @Builder.Default
    private String tipo = "OBSERVACION";

    @Column(name = "subsanado")
    @Builder.Default
    private Boolean subsanado = false;

    @Column(name = "fecha_subsanacion")
    private LocalDateTime fechaSubsanacion;

    @Column(name = "respuesta_subsanacion", columnDefinition = "TEXT")
    private String respuestaSubsanacion;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;
}
