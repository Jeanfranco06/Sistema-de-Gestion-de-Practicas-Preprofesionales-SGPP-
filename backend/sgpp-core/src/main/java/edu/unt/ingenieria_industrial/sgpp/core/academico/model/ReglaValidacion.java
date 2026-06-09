package edu.unt.ingenieria_industrial.sgpp.core.academico.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@Table(name = "regla_validacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ReglaValidacion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_practica", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TipoPractica tipoPractica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_norma", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private NormaValidacion norma;

    @Column(name = "codigo", length = 50, nullable = false)
    private String codigo;

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "obligatorio", nullable = false)
    @Builder.Default
    private Boolean obligatorio = true;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
