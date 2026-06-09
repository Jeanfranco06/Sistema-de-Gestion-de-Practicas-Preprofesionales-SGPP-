package edu.unt.ingenieria_industrial.sgpp.core.empresarial.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "validacion_sede")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ValidacionSede extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede", nullable = false)
    private SedePractica sede;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_validador", nullable = false)
    private Usuario usuarioValidador;

    @Column(name = "fecha_validacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaValidacion = LocalDateTime.now();

    // Criterios de validación
    @Column(name = "criterio_infraestructura_cumple", nullable = false)
    private Boolean criterioInfraestructuraCumple;

    @Column(name = "criterio_infraestructura_observaciones", columnDefinition = "TEXT")
    private String criterioInfraestructuraObservaciones;

    @Column(name = "criterio_seguridad_salud_cumple", nullable = false)
    private Boolean criterioSeguridadSaludCumple;

    @Column(name = "criterio_seguridad_salud_observaciones", columnDefinition = "TEXT")
    private String criterioSeguridadSaludObservaciones;

    @Column(name = "criterio_afinidad_carrera_cumple", nullable = false)
    private Boolean criterioAfinidadCarreraCumple;

    @Column(name = "criterio_afinidad_carrera_observaciones", columnDefinition = "TEXT")
    private String criterioAfinidadCarreraObservaciones;

    @Column(name = "criterio_tutor_designado_cumple", nullable = false)
    private Boolean criterioTutorDesignadoCumple;

    @Column(name = "criterio_tutor_designado_observaciones", columnDefinition = "TEXT")
    private String criterioTutorDesignadoObservaciones;

    @Column(name = "criterio_convenio_acuerdo_cumple", nullable = false)
    private Boolean criterioConvenioAcuerdoCumple;

    @Column(name = "criterio_convenio_acuerdo_observaciones", columnDefinition = "TEXT")
    private String criterioConvenioAcuerdoObservaciones;

    // Criterios adicionales opcionales
    @Column(name = "otro_criterio_1_nombre", length = 100)
    private String otroCriterio1Nombre;

    @Column(name = "otro_criterio_1_cumple")
    private Boolean otroCriterio1Cumple;

    @Column(name = "otro_criterio_1_observaciones", columnDefinition = "TEXT")
    private String otroCriterio1Observaciones;

    @Column(name = "otro_criterio_2_nombre", length = 100)
    private String otroCriterio2Nombre;

    @Column(name = "otro_criterio_2_cumple")
    private Boolean otroCriterio2Cumple;

    @Column(name = "otro_criterio_2_observaciones", columnDefinition = "TEXT")
    private String otroCriterio2Observaciones;

    // Resultado de la validación
    @Column(name = "resultado_validacion", nullable = false, length = 20)
    private String resultadoValidacion;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    // Vigencia de la validación
    @Column(name = "fecha_vigencia_desde", nullable = false)
    private LocalDate fechaVigenciaDesde;

    @Column(name = "fecha_vigencia_hasta", nullable = false)
    private LocalDate fechaVigenciaHasta;
}
