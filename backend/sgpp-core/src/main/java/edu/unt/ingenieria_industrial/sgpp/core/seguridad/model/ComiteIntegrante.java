package edu.unt.ingenieria_industrial.sgpp.core.seguridad.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
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
@Table(name = "comite_integrante")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ComiteIntegrante extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_docente")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Docente docente;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol_comite", nullable = false, length = 20)
    private RolComite rolComite;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "ACTIVO";

    @Column(name = "resolucion_designacion", length = 255)
    private String resolucionDesignacion;

    @Column(name = "periodo_academico", length = 50)
    private String periodoAcademico;

    public enum RolComite {
        PRESIDENTE,
        MIEMBRO
    }
}
