package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionResponseDTO {
    private Long id;
    private Long idExpediente;
    private String nombreEstudiante;
    private String tipoEvaluador;
    private Long evaluadorId;
    private String componente;
    private Integer puntajeTotal;
    private BigDecimal promedioFinal;
    private String calificacionCualitativa; // Para prácticas extracurriculares
    private String comentarios;
    private LocalDate fechaEvaluacion;
    private List<DetalleEvaluacionDTO> detalles;
    private Integer horasRegistradas;
    private String rutaConstancia;
    private String tipoCalificacion;
    private Boolean activo;
}

