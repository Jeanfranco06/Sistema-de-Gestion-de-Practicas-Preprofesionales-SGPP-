package edu.unt.ingenieria_industrial.sgpp.core.hora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ControlHoraResponse {
    private Long id;
    private Long idExpediente;
    private String codigoExpediente;
    private String tipoPractica;
    private Integer horasRequeridas;
    private Integer horasAcumuladas;
    private Integer horasPendientes;
    private LocalDate fechaInicio;
    private LocalDate fechaFinEstimada;
    private LocalDate fechaFinReal;
    private String estado;
    private Boolean cumplimientoAlcanzado;
    private String alerta;
}
