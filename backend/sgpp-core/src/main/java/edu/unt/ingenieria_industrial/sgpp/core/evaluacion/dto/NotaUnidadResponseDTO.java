package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotaUnidadResponseDTO {

    private Long id;
    private Long idExpediente;
    private Integer numeroUnidad;
    private BigDecimal notaPlan;
    private BigDecimal notaInforme;
    private BigDecimal notaFinalUnidad;
    private Integer porcentajePlan;
    private Integer porcentajeInforme;
    private String comentarios;
    private LocalDate fechaEvaluacion;
    private Long idEvaluador;
    private String nombreEvaluador;
    private BigDecimal promedioFinal;
    private Boolean aprobado;
}
