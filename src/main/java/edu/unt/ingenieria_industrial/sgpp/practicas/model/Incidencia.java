package edu.unt.ingenieria_industrial.sgpp.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "incidencia")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Incidencia extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practica", nullable = false)
    private Practica practica;

    @Column(name = "tipo_incidencia", length = 50, nullable = false)
    private String tipoIncidencia;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDate fechaReporte;

    @Column(name = "descripcion", columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "estado", length = 50, nullable = false)
    private String estado;

    @Column(name = "fecha_resolucion")
    private LocalDate fechaResolucion;

    @Column(name = "resolucion", columnDefinition = "TEXT")
    private String resolucion;

    @Column(name = "reportado_por", length = 100)
    private String reportadoPor;
}
