package edu.unt.ingenieria_industrial.sgpp.core.academico.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionAcademicaResponse {

    private Long idResultado;
    private Long estudianteId;
    private String nombreEstudiante;
    private String codigoEstudiantil;
    private String tipoPractica;
    private String normaAplicada;
    private String periodoAcademico;
    private Boolean habilitado;
    private LocalDateTime fechaValidacion;
    private List<DetalleValidacionDTO> detalles;
    private String observacionesGenerales;
    private int reglasCumplidas;
    private int reglasIncumplidas;
    private int totalReglas;
}
