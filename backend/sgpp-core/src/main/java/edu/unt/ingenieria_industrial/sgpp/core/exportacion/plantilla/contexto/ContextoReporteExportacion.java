package edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.contexto;

import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteResultadoDTO;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ContextoReporteExportacion {
    private ReporteResultadoDTO<?> reporte;
    private ReporteFiltroDTO filtros;
    private String nombreSolicitante;
    private String periodoConsultado;
    private String filtrosDescripcion;
    private String codigoTrazabilidad;
    private LocalDateTime fechaGeneracion;
}
