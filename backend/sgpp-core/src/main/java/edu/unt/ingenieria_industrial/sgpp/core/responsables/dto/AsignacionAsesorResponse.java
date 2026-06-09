package edu.unt.ingenieria_industrial.sgpp.core.responsables.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionAsesorResponse {

    private Long id;
    private Long idDocente;
    private String codigoDocente;
    private String nombresDocente;
    private String apellidosDocente;
    private String categoriaDocente;
    private Long idEstudiante;
    private String codigoEstudiantil;
    private String nombresEstudiante;
    private String apellidosEstudiante;
    private String tipoPractica;
    private String periodoAcademico;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    private String resolucionDesignacion;
    private String motivoReasignacion;
}
