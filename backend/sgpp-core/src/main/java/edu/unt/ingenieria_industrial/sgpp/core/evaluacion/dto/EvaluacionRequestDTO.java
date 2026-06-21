package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionRequestDTO {
    @NotNull(message = "El idExpediente no puede ser nulo")
    private Long idExpediente;
    
    @NotBlank(message = "El tipoEvaluador no puede estar vacío")
    private String tipoEvaluador;
    
    @NotNull(message = "El evaluadorId no puede ser nulo")
    private Long evaluadorId;
    
    @NotBlank(message = "El componente no puede estar vacío")
    private String componente; // EMPRESA, DOCENTE, INFORME, SUSTENTACION
    
    @NotEmpty(message = "Los detalles de la evaluación no pueden estar vacíos")
    @Valid
    private List<DetalleEvaluacionRequestDTO> detalles;
    
    private String comentarios;
    private LocalDate fechaEvaluacion;
    private Integer horasRegistradas;
    private String rutaConstancia;
    private String tipoCalificacion; // VIGESIMAL, CUALITATIVA
}

