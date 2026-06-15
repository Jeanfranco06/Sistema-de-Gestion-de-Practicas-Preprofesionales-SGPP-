package edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoGraficoKpi;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiMetadataDTO {

    private String codigo;
    private String nombre;
    private String descripcion;
    private String formula;
    private String fuenteDatos;
    private String fechaReferencia;
    private TipoGraficoKpi tipoGraficoSugerido;
    private LocalDateTime calculadoEn;
}
