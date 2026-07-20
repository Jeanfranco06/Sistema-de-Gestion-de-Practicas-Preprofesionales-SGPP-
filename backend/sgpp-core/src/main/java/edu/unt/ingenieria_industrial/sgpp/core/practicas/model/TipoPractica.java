package edu.unt.ingenieria_industrial.sgpp.core.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "curricular", nullable = false)
    @Builder.Default
    private Boolean curricular = true;

    @Column(name = "duracion_minima_dias")
    private Integer duracionMinimaDias;

    @Column(name = "ciclo_minimo")
    private Integer cicloMinimo;

    @Column(name = "creditos")
    private Integer creditos;

    @Column(name = "condicion_acceso", length = 50)
    private String condicionAcceso;

    @Column(name = "tipo_calificacion", length = 20, nullable = false)
    @Builder.Default
    private String tipoCalificacion = "VIGESIMAL";

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
