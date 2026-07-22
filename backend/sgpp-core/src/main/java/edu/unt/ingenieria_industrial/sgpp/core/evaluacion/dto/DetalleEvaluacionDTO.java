package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleEvaluacionDTO {
    private Long id;
    private Long idCriterio;
    private String nombreCriterio;
    private Integer puntajeMaximo;
    private Integer puntajeObtenido;
    private String calificacionCualitativa;
    private String comentarios;
}

