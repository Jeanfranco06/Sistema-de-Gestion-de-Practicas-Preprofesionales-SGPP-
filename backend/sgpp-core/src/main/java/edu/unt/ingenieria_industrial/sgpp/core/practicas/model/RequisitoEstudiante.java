package edu.unt.ingenieria_industrial.sgpp.core.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.shared.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "requisito_estudiante")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RequisitoEstudiante extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_requisito_academico", nullable = false)
    private RequisitoAcademico requisitoAcademico;

    @Column(name = "cumplido", nullable = false)
    @Builder.Default
    private Boolean cumplido = false;

    @Column(name = "fecha_cumplimiento")
    private LocalDate fechaCumplimiento;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}

