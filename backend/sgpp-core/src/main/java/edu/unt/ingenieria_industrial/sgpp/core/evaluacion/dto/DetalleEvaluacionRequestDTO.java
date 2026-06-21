package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleEvaluacionRequestDTO {
    @NotNull(message = "El idCriterio no puede ser nulo")
    private Long idCriterio;
    
    @NotNull(message = "El puntajeObtenido no puede ser nulo")
    private Integer puntajeObtenido;
    
    private String comentarios;
}

