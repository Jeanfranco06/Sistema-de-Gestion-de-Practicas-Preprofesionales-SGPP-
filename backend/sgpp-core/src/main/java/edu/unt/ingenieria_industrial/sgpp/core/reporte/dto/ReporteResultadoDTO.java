package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResultadoDTO<T> {

    private TipoReporte tipoReporte;
    private String titulo;
    private String descripcion;
    private ReporteFiltroDTO filtrosAplicados;
    private ResumenDashboardDTO resumen;
    private List<T> registros;
    private long totalRegistros;
    private LocalDateTime generadoEn;
}
