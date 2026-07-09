package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComponenteEvaluacionDTO {
    private Long id;
    private Long idExpediente;
    private String tipoComponente; // PLAN, EMPRESA, INFORME
    private Integer puntajeMaximo;
    private Integer puntajeObtenido;
    private Integer porcentaje;
    private Long evaluadorId;
    private String tipoEvaluador;
    private LocalDate fechaEvaluacion;
    private String observaciones;
    private String estado; // PENDIENTE, COMPLETADO, OBSERVADO
    private Boolean activo;
}
