package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

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
public class SubsanacionPendienteItemDTO {

    private Long idObservacion;
    private Long idExpediente;
    private String codigoExpediente;
    private String estadoExpediente;
    private String codigoEstudiantil;
    private String nombreEstudiante;
    private String codigoTipoPractica;
    private String tipoObservacion;
    private String descripcionObservacion;
    private LocalDateTime fechaObservacion;
    private LocalDate fechaLimiteSubsanacion;
    private String condicionPlazo;
    private long diasRestantes;
    private boolean vencido;
    private String origenObservacion;
}
