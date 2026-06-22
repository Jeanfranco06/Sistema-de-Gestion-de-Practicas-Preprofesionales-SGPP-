package edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.config.ExportacionProperties;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.mapper.ReporteTablaMapper;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.contexto.ContextoReporteExportacion;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ResumenDashboardDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PlantillaReporteConsolidado implements PlantillaDocumento<ContextoReporteExportacion> {

    private final ExportacionProperties properties;
    private final ReporteTablaMapper tablaMapper;

    @Override
    public TipoDocumentoInstitucional getTipoDocumento() {
        return TipoDocumentoInstitucional.REPORTE_EXPORTADO;
    }

    @Override
    public DocumentoRenderizable construir(ContextoReporteExportacion ctx) {
        var reporte = ctx.getReporte();
        var meta = DocumentoRenderizable.MetadatosDocumento.builder()
                .titulo(reporte.getTitulo())
                .subtitulo(reporte.getDescripcion())
                .institucion(properties.getNombreInstitucion())
                .unidadAcademica(properties.getUnidadAcademica())
                .tipoDocumento(TipoDocumentoInstitucional.REPORTE_EXPORTADO.name())
                .tipoReporte(reporte.getTipoReporte().name())
                .periodoConsultado(ctx.getPeriodoConsultado())
                .filtrosDescripcion(ctx.getFiltrosDescripcion())
                .generadoPor(ctx.getNombreSolicitante())
                .fechaGeneracion(ctx.getFechaGeneracion())
                .codigoTrazabilidad(ctx.getCodigoTrazabilidad())
                .build();

        List<DocumentoRenderizable.SeccionDocumento> secciones = new ArrayList<>();

        ResumenDashboardDTO resumen = reporte.getResumen();
        if (resumen != null) {
            secciones.add(DocumentoRenderizable.SeccionDocumento.builder()
                    .titulo("Resumen ejecutivo")
                    .tipo(DocumentoRenderizable.TipoSeccion.CAMPOS)
                    .campos(Map.of(
                            "Total registros", String.valueOf(resumen.getTotalRegistros()),
                            "Expedientes activos", String.valueOf(resumen.getExpedientesActivos()),
                            "Expedientes cerrados", String.valueOf(resumen.getExpedientesCerrados()),
                            "Subsanaciones pendientes", String.valueOf(resumen.getSubsanacionesPendientes()),
                            "Convenios vigentes", String.valueOf(resumen.getConveniosVigentes()),
                            "Sedes validadas vigentes", String.valueOf(resumen.getSedesValidadasVigentes())
                    ))
                    .build());

            if (resumen.getConteoPorEstado() != null && !resumen.getConteoPorEstado().isEmpty()) {
                secciones.add(tablaDesdeMapa("Distribución por estado", resumen.getConteoPorEstado()));
            }
            if (resumen.getConteoPorTipoPractica() != null && !resumen.getConteoPorTipoPractica().isEmpty()) {
                secciones.add(tablaDesdeMapa("Distribución por tipo de práctica", resumen.getConteoPorTipoPractica()));
            }
        }

        ReporteTablaMapper.TablaExportable tabla = tablaMapper.mapear(reporte);
        secciones.add(DocumentoRenderizable.SeccionDocumento.builder()
                .titulo("Detalle del reporte")
                .tipo(DocumentoRenderizable.TipoSeccion.TABLA)
                .encabezados(tabla.encabezados())
                .filas(tabla.filas())
                .build());

        return DocumentoRenderizable.builder()
                .metadatos(meta)
                .secciones(secciones)
                .build();
    }

    private DocumentoRenderizable.SeccionDocumento tablaDesdeMapa(String titulo, Map<String, Long> datos) {
        return DocumentoRenderizable.SeccionDocumento.builder()
                .titulo(titulo)
                .tipo(DocumentoRenderizable.TipoSeccion.TABLA)
                .encabezados(List.of("Categoría", "Cantidad"))
                .filas(datos.entrySet().stream()
                        .map(e -> List.of(e.getKey(), String.valueOf(e.getValue())))
                        .collect(Collectors.toList()))
                .build();
    }
}
