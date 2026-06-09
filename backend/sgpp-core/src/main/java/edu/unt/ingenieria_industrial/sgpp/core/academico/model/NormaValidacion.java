package edu.unt.ingenieria_industrial.sgpp.core.academico.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "norma_validacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NormaValidacion extends BaseEntity {

    @Column(name = "codigo", length = 50, unique = true, nullable = false)
    private String codigo;

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_vigencia_inicio", nullable = false)
    private LocalDate fechaVigenciaInicio;

    @Column(name = "fecha_vigencia_fin")
    private LocalDate fechaVigenciaFin;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
