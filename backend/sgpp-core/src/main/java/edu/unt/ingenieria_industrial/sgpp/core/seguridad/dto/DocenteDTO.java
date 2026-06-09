package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocenteDTO {
    private Long id;
    private String codigoDocente;
    private String categoria;
    private String especialidad;
    private String departamento;
    private Boolean activo;
    private Integer maxPracticantes;
}
