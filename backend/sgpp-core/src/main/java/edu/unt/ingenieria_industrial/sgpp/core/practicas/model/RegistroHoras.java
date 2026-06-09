package edu.unt.ingenieria_industrial.sgpp.core.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "registro_horas")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegistroHoras extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practica", nullable = false)
    private Practica practica;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "horas_registradas", nullable = false)
    private Integer horasRegistradas;

    @Column(name = "actividades_realizadas", columnDefinition = "TEXT")
    private String actividadesRealizadas;

    @Column(name = "aprobado_por_tutor")
    private Boolean aprobadoPorTutor;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}

