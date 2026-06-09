package edu.unt.ingenieria_industrial.sgpp.core.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "tipo_practica")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TipoPractica extends BaseEntity {

    @Column(name = "codigo", length = 50, unique = true, nullable = false)
    private String codigo;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "horas_requeridas")
    private Integer horasRequeridas;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

