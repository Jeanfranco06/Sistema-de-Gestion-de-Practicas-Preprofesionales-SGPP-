package edu.unt.ingenieria_industrial.sgpp.core.academico.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NormaValidacionDTO {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private LocalDate fechaVigenciaInicio;
    private LocalDate fechaVigenciaFin;
    private Boolean activo;
    private Boolean vigente;
}
