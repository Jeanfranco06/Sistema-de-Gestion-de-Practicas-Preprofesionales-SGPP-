package edu.unt.ingenieria_industrial.sgpp.evaluacion.model;

import edu.unt.ingenieria_industrial.sgpp.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.practicas.model.Practica;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "evaluacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Evaluacion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practica", nullable = false)
    private Practica practica;

    @Column(name = "tipo_evaluador", length = 50, nullable = false)
    private String tipoEvaluador; // EMPRESA, DOCENTE

    @Column(name = "evaluador_id")
    private Long evaluadorId;

    @Column(name = "puntaje_asistencia")
    private Integer puntajeAsistencia;

    @Column(name = "puntaje_responsabilidad")
    private Integer puntajeResponsabilidad;

    @Column(name = "puntaje_conocimiento")
    private Integer puntajeConocimiento;

    @Column(name = "puntaje_actitud")
    private Integer puntajeActitud;

    @Column(name = "puntaje_total")
    private Integer puntajeTotal;

    @Column(name = "comentarios", columnDefinition = "TEXT")
    private String comentarios;

    @Column(name = "fecha_evaluacion", nullable = false)
    private LocalDate fechaEvaluacion;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
