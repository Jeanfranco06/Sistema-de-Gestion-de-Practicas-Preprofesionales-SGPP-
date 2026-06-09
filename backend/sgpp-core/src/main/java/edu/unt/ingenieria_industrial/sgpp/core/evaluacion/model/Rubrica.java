package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "rubrica")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Rubrica extends BaseEntity {

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tipo_evaluador", length = 50, nullable = false)
    private String tipoEvaluador;

    @Column(name = "puntaje_total", nullable = false)
    private Integer puntajeTotal;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

