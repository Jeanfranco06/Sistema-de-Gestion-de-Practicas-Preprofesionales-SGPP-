package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpedienteCerradoItemDTO {

    private Long idExpediente;
    private String codigoExpediente;
    private String estadoFinal;
    private String codigoTipoPractica;
    private String nombreTipoPractica;
    private String periodoAcademico;
    private String condicionSolicitante;
    private String codigoEstudiantil;
    private String nombreEstudiante;
    private String razonSocialEmpresa;
    private String nombreSede;
    private String nombreAsesor;
    private LocalDate fechaInicioPractica;
    private LocalDate fechaFinPractica;
    private BigDecimal calificacionFinal;
    private Boolean informeFinalPresentado;
    private LocalDateTime fechaCierre;
    private String motivoCierre;
}
