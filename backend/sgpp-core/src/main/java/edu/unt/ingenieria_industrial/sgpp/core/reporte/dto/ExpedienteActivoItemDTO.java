package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpedienteActivoItemDTO {

    private Long idExpediente;
    private String codigoExpediente;
    private String estadoActual;
    private String etapaFlujo;
    private String codigoTipoPractica;
    private String nombreTipoPractica;
    private String periodoAcademico;
    private String condicionSolicitante;
    private Long idEstudiante;
    private String codigoEstudiantil;
    private String nombreEstudiante;
    private Long idEmpresa;
    private String razonSocialEmpresa;
    private Long idSede;
    private String nombreSede;
    private Long idAsesor;
    private String nombreAsesor;
    private List<String> miembrosComite;
    private LocalDate fechaInicioPractica;
    private LocalDate fechaFinPractica;
}
