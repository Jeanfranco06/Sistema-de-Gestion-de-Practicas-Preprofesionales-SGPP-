package edu.unt.ingenieria_industrial.sgpp.core.practicas.dto;

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
public class PracticaDTO {
    private Long id;
    private Long idEstudiante;
    private String nombreEstudiante;
    private Long idSede;
    private String nombreSede;
    private Long idTutorExterno;
    private String nombreTutorExterno;
    private Long idEstado;
    private String codigoEstado;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer horasTotales;
    private Integer horasRestantes;
    private String areaPractica;
    private String descripcionPuesto;
    private Boolean remunerado;
    private BigDecimal montoRemuneracion;
    private Boolean activo;
}
