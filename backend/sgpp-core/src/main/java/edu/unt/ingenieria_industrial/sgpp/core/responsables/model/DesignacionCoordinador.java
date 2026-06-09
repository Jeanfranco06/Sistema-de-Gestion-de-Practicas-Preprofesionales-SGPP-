package edu.unt.ingenieria_industrial.sgpp.core.responsables.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Docente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "designacion_coordinador")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DesignacionCoordinador extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_docente", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Docente docente;

    @Column(name = "periodo_academico", length = 20, nullable = false)
    private String periodoAcademico;

    @Column(name = "fecha_designacion", nullable = false)
    private LocalDate fechaDesignacion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "estado", length = 20, nullable = false)
    @Builder.Default
    private String estado = "ACTIVO";

    @Column(name = "resolucion_designacion", length = 255)
    private String resolucionDesignacion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
