package edu.unt.ingenieria_industrial.sgpp.core.academico.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "resultado_validacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ResultadoValidacion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_practica", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TipoPractica tipoPractica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_norma", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private NormaValidacion norma;

    @Column(name = "habilitado", nullable = false)
    private Boolean habilitado;

    @Column(name = "periodo_academico", length = 20)
    private String periodoAcademico;

    @Column(name = "fecha_validacion", nullable = false)
    private LocalDateTime fechaValidacion;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
