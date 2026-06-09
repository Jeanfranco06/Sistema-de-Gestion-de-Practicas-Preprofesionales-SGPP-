package edu.unt.ingenieria_industrial.sgpp.core.academico.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReglaValidacionDTO {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Boolean obligatorio;
    private Integer orden;
    private Long idNorma;
    private String nombreNorma;
    private String codigoNorma;
    private Long idTipoPractica;
    private String codigoTipoPractica;
    private String nombreTipoPractica;
}
