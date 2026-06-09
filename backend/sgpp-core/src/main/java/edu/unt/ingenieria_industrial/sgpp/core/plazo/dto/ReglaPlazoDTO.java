package edu.unt.ingenieria_industrial.sgpp.core.plazo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReglaPlazoDTO {
    private Long id;
    private String codigo;
    private Long idTipoPractica;
    private String codigoTipoPractica;
    private String nombre;
    private String descripcion;
    private String etapaExpediente;
    private Integer diasPlazo;
    private String tipoComputo;
    private Integer orden;
    private Boolean activo;
    private Integer diasProximoVencer;
}
