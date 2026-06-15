package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

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
public class EvaluacionRequestDTO {
    private Long idPractica;
    private String tipoEvaluador;
    private Long evaluadorId;
    private String unidad; // U1, U2, U3
    private List<DetalleEvaluacionRequestDTO> detalles;
    private String comentarios;
    private LocalDate fechaEvaluacion;
    private Integer horasRegistradas;
    private String rutaConstancia;
    private String tipoCalificacion; // VIGESIMAL, CUALITATIVA
}

