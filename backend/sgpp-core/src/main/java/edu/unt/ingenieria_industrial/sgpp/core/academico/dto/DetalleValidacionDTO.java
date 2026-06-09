package edu.unt.ingenieria_industrial.sgpp.core.academico.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleValidacionDTO {

    private String codigoRegla;
    private String nombreRegla;
    private String descripcion;
    private Boolean obligatorio;
    private Boolean cumplido;
    private String observaciones;
    private Integer orden;
}
