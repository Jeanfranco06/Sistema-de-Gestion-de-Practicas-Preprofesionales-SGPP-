package edu.unt.ingenieria_industrial.sgpp.core.practicas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequisitoAcademicoDTO {
    private Long id;
    private Long idTipoPractica;
    private String codigoTipoPractica;
    private String nombreTipoPractica;
    private String nombre;
    private String descripcion;
    private Boolean obligatorio;
    private Boolean activo;
}
