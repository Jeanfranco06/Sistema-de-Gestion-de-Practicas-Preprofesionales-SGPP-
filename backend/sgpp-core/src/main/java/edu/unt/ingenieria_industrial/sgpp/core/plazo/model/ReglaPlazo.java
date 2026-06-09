package edu.unt.ingenieria_industrial.sgpp.core.plazo.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "regla_plazo")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ReglaPlazo extends BaseEntity {

    @Column(name = "codigo", nullable = false, length = 50, unique = true)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_practica")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private TipoPractica tipoPractica;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "etapa_expediente", length = 30)
    private String etapaExpediente;

    @Column(name = "dias_plazo", nullable = false)
    private Integer diasPlazo;

    @Column(name = "tipo_computo", nullable = false, length = 20)
    @Builder.Default
    private String tipoComputo = "CALENDARIO";

    @Column(name = "orden")
    private Integer orden;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "dias_proximo_vencer")
    @Builder.Default
    private Integer diasProximoVencer = 3;
}
