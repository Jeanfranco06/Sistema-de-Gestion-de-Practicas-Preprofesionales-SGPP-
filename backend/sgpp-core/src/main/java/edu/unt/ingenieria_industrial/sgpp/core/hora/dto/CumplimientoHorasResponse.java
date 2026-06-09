package edu.unt.ingenieria_industrial.sgpp.core.hora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CumplimientoHorasResponse {
    private boolean cumplido;
    private String tipoPractica;
    private Integer horasRequeridas;
    private Integer horasAcumuladas;
    private Integer horasPendientes;
    private String periodoEjecucion;
    private boolean coherenciaTemporalOk;
    private String mensaje;
    @Builder.Default
    private List<String> alertas = new ArrayList<>();
}
