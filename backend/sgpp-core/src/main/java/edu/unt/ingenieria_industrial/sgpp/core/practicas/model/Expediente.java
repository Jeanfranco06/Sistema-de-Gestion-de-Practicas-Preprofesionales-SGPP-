package edu.unt.ingenieria_industrial.sgpp.core.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "expediente")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Expediente extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tutor_empresa")
    private TutorExterno tutorEmpresa;

    @Column(name = "numero_expediente", length = 50, unique = true, nullable = false)
    private String numeroExpediente;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDate fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDate fechaCierre;

    @Column(name = "estado", length = 50, nullable = false)
    private String estado;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

