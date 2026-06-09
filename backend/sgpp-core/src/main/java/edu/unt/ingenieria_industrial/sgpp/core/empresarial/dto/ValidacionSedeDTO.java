package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionSedeDTO {
    private Long id;
    private Long sedeId;
    private String nombreSede;
    private Long usuarioValidadorId;
    private String nombreValidador;
    private LocalDateTime fechaValidacion;

    // Criterios de validación
    private Boolean criterioInfraestructuraCumple;
    private String criterioInfraestructuraObservaciones;

    private Boolean criterioSeguridadSaludCumple;
    private String criterioSeguridadSaludObservaciones;

    private Boolean criterioAfinidadCarreraCumple;
    private String criterioAfinidadCarreraObservaciones;

    private Boolean criterioTutorDesignadoCumple;
    private String criterioTutorDesignadoObservaciones;

    private Boolean criterioConvenioAcuerdoCumple;
    private String criterioConvenioAcuerdoObservaciones;

    // Criterios adicionales opcionales
    private String otroCriterio1Nombre;
    private Boolean otroCriterio1Cumple;
    private String otroCriterio1Observaciones;

    private String otroCriterio2Nombre;
    private Boolean otroCriterio2Cumple;
    private String otroCriterio2Observaciones;

    // Resultado de la validación
    private String resultadoValidacion;
    private String observacionesGenerales;

    // Vigencia de la validación
    private LocalDate fechaVigenciaDesde;
    private LocalDate fechaVigenciaHasta;
}
