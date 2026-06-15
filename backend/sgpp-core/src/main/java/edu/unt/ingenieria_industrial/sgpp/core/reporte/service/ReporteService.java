package edu.unt.ingenieria_industrial.sgpp.core.reporte.service;

import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.*;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;

public interface ReporteService {

    ReporteResultadoDTO<ExpedienteActivoItemDTO> generarExpedientesActivos(ReporteFiltroDTO filtros);

    ReporteResultadoDTO<ExpedienteCerradoItemDTO> generarExpedientesCerrados(ReporteFiltroDTO filtros);

    ReporteResultadoDTO<PracticaPorTipoItemDTO> generarPracticasPorTipo(ReporteFiltroDTO filtros);

    ReporteResultadoDTO<EmpresaReceptoraItemDTO> generarEmpresasReceptoras(ReporteFiltroDTO filtros);

    ReporteResultadoDTO<SedeValidadaItemDTO> generarSedesValidadas(ReporteFiltroDTO filtros);

    ReporteResultadoDTO<ConvenioVigenteItemDTO> generarConveniosVigentes(ReporteFiltroDTO filtros);

    ReporteResultadoDTO<SubsanacionPendienteItemDTO> generarSubsanacionesPendientes(ReporteFiltroDTO filtros);

    ReporteResultadoDTO<?> generarReporte(TipoReporte tipo, ReporteFiltroDTO filtros);

    ResumenDashboardDTO obtenerResumenEjecutivo(ReporteFiltroDTO filtros);
}
