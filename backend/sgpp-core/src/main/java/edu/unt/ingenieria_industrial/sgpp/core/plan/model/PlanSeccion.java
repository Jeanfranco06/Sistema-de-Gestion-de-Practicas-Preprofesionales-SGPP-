package edu.unt.ingenieria_industrial.sgpp.core.plan.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "plan_seccion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PlanSeccion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private PlanGeneral plan;

    @Column(name = "tipo_seccion", nullable = false, length = 40)
    private String tipoSeccion;

    @Column(name = "contenido", columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;
}
