package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model;

import edu.unt.ingenieria_industrial.sgpp.shared.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "criterio_evaluacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CriterioEvaluacion extends BaseEntity {

    @Column(name = "codigo", length = 50, unique = true, nullable = false)
    private String codigo;

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "puntaje_maximo", nullable = false)
    private Integer puntajeMaximo;

    @Column(name = "tipo_evaluador", length = 50, nullable = false)
    private String tipoEvaluador; // EMPRESA, DOCENTE

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

