package edu.unt.ingenieria_industrial.sgpp.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.sedes.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.shared.model.EstadoPractica;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.TutorExterno;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "practica")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Practica extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede", nullable = false)
    private SedePractica sede;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tutor_externo")
    private TutorExterno tutorExterno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado", nullable = false)
    private EstadoPractica estado;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "horas_totales")
    private Integer horasTotales;

    @Column(name = "horas_restantes")
    private Integer horasRestantes;

    @Column(name = "area_practica", length = 100)
    private String areaPractica;

    @Column(name = "descripcion_puesto", columnDefinition = "TEXT")
    private String descripcionPuesto;

    @Column(name = "remunerado", nullable = false)
    @Builder.Default
    private Boolean remunerado = false;

    @Column(name = "monto_remuneracion", precision = 10, scale = 2)
    private BigDecimal montoRemuneracion;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
