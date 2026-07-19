package edu.unt.ingenieria_industrial.sgpp.core.exportacion.service;

import edu.unt.ingenieria_industrial.sgpp.core.plan.dto.PlanGeneralResponse;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.ArchivoExportadoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.GenerarDocumentoInternoRequest;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.RegistroGeneracionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;

import java.util.List;

public interface ExportacionService {

    ArchivoExportadoDTO exportarReporte(TipoReporte tipoReporte, FormatoExportacion formato, ReporteFiltroDTO filtros);

    ArchivoExportadoDTO generarDocumentoInterno(GenerarDocumentoInternoRequest request);

    List<RegistroGeneracionDTO> consultarHistorial(Long idExpediente, Long idUsuario);

    byte[] generarPlanGeneralPdf(Long planId);
}
