package edu.unt.ingenieria_industrial.sgpp.core.practicas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoPracticaDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Integer horasRequeridas;
    private Boolean activo;
}
