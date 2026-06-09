package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.ComiteIntegrante;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComiteIntegranteResponse {
    private Long id;
    private Long idUsuario;
    private String nombres;
    private String apellidos;
    private String email;
    private Long idDocente;
    private String codigoDocente;
    private ComiteIntegrante.RolComite rolComite;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    private String resolucionDesignacion;
    private String periodoAcademico;
}
