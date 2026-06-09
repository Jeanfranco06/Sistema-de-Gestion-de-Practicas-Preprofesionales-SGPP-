package edu.unt.ingenieria_industrial.sgpp.core.academico.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@Table(name = "detalle_validacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DetalleValidacion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_resultado", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ResultadoValidacion resultadoValidacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_regla", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ReglaValidacion reglaValidacion;

    @Column(name = "cumplido", nullable = false)
    private Boolean cumplido;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "orden", nullable = false)
    private Integer orden;
}
