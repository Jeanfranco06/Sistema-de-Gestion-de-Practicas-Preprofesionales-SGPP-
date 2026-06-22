package edu.unt.ingenieria_industrial.sgpp.core.exportacion.mapper;

import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.*;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ReporteTablaMapper {

    public record TablaExportable(List<String> encabezados, List<List<String>> filas) {}

    public TablaExportable mapear(ReporteResultadoDTO<?> reporte) {
        if (reporte.getRegistros() == null || reporte.getRegistros().isEmpty()) {
            return new TablaExportable(List.of("Sin registros"), List.of());
        }

        return switch (reporte.getTipoReporte()) {
            case EXPEDIENTES_ACTIVOS -> mapearActivos(cast(reporte.getRegistros()));
            case EXPEDIENTES_CERRADOS -> mapearCerrados(cast(reporte.getRegistros()));
            case PRACTICAS_POR_TIPO -> mapearPorTipo(cast(reporte.getRegistros()));
            case EMPRESAS_RECEPTORAS -> mapearEmpresas(cast(reporte.getRegistros()));
            case SEDES_VALIDADAS -> mapearSedes(cast(reporte.getRegistros()));
            case CONVENIOS_VIGENTES -> mapearConvenios(cast(reporte.getRegistros()));
            case SUBSANACIONES_PENDIENTES -> mapearSubsanaciones(cast(reporte.getRegistros()));
        };
    }

    @SuppressWarnings("unchecked")
    private <T> List<T> cast(List<?> list) {
        return (List<T>) list;
    }

    private TablaExportable mapearActivos(List<ExpedienteActivoItemDTO> items) {
        List<String> enc = List.of(
                "Código", "Estado", "Etapa", "Tipo práctica", "Periodo", "Estudiante",
                "Código estudiantil", "Empresa", "Sede", "Asesor", "Inicio", "Fin");
        return new TablaExportable(enc, items.stream().map(i -> List.of(
                s(i.getCodigoExpediente()), s(i.getEstadoActual()), s(i.getEtapaFlujo()),
                s(i.getNombreTipoPractica()), s(i.getPeriodoAcademico()), s(i.getNombreEstudiante()),
                s(i.getCodigoEstudiantil()), s(i.getRazonSocialEmpresa()), s(i.getNombreSede()),
                s(i.getNombreAsesor()), s(i.getFechaInicioPractica()), s(i.getFechaFinPractica())
        )).toList());
    }

    private TablaExportable mapearCerrados(List<ExpedienteCerradoItemDTO> items) {
        List<String> enc = List.of(
                "Código", "Estado final", "Tipo práctica", "Periodo", "Estudiante",
                "Empresa", "Sede", "Calificación", "Fecha cierre");
        return new TablaExportable(enc, items.stream().map(i -> List.of(
                s(i.getCodigoExpediente()), s(i.getEstadoFinal()), s(i.getNombreTipoPractica()),
                s(i.getPeriodoAcademico()), s(i.getNombreEstudiante()), s(i.getRazonSocialEmpresa()),
                s(i.getNombreSede()), s(i.getCalificacionFinal()), s(i.getFechaCierre())
        )).toList());
    }

    private TablaExportable mapearPorTipo(List<PracticaPorTipoItemDTO> items) {
        List<String> enc = List.of(
                "Código", "Nombre", "Horas requeridas", "Total", "Activos", "Cerrados", "En ejecución");
        return new TablaExportable(enc, items.stream().map(i -> List.of(
                s(i.getCodigoTipoPractica()), s(i.getNombreTipoPractica()), s(i.getHorasRequeridas()),
                s(i.getTotalExpedientes()), s(i.getExpedientesActivos()), s(i.getExpedientesCerrados()),
                s(i.getEnEjecucion())
        )).toList());
    }

    private TablaExportable mapearEmpresas(List<EmpresaReceptoraItemDTO> items) {
        List<String> enc = List.of(
                "RUC", "Razón social", "Sector", "Total expedientes", "Activos",
                "Convenios vigentes", "Sedes", "Tipos práctica");
        return new TablaExportable(enc, items.stream().map(i -> List.of(
                s(i.getRuc()), s(i.getRazonSocial()), s(i.getSectorEconomico()),
                s(i.getTotalExpedientes()), s(i.getExpedientesActivos()), s(i.getConveniosVigentes()),
                s(i.getSedesAsociadas()), i.getTiposPracticaAtendidos() != null
                        ? String.join(", ", i.getTiposPracticaAtendidos()) : ""
        )).toList());
    }

    private TablaExportable mapearSedes(List<SedeValidadaItemDTO> items) {
        List<String> enc = List.of(
                "Sede", "Empresa", "Resultado", "Vigente desde", "Vigente hasta",
                "Validador", "Expedientes", "Activos");
        return new TablaExportable(enc, items.stream().map(i -> List.of(
                s(i.getNombreSede()), s(i.getRazonSocialEmpresa()), s(i.getResultadoValidacion()),
                s(i.getFechaVigenciaDesde()), s(i.getFechaVigenciaHasta()), s(i.getValidador()),
                s(i.getExpedientesVinculados()), s(i.getExpedientesActivos())
        )).toList());
    }

    private TablaExportable mapearConvenios(List<ConvenioVigenteItemDTO> items) {
        List<String> enc = List.of(
                "Número", "Empresa", "RUC", "Inicio", "Fin", "Estado vigencia",
                "Expedientes en ejecución", "Total asociados");
        return new TablaExportable(enc, items.stream().map(i -> List.of(
                s(i.getNumeroConvenio()), s(i.getRazonSocialEmpresa()), s(i.getRucEmpresa()),
                s(i.getFechaInicio()), s(i.getFechaFin()), s(i.getEstadoVigencia()),
                s(i.getExpedientesEnEjecucion()), s(i.getTotalExpedientesAsociados())
        )).toList());
    }

    private TablaExportable mapearSubsanaciones(List<SubsanacionPendienteItemDTO> items) {
        List<String> enc = List.of(
                "Expediente", "Estudiante", "Tipo práctica", "Estado expediente",
                "Tipo observación", "Fecha observación", "Fecha límite", "Condición plazo", "Vencido");
        return new TablaExportable(enc, items.stream().map(i -> List.of(
                s(i.getCodigoExpediente()), s(i.getNombreEstudiante()), s(i.getCodigoTipoPractica()),
                s(i.getEstadoExpediente()), s(i.getTipoObservacion()), s(i.getFechaObservacion()),
                s(i.getFechaLimiteSubsanacion()), s(i.getCondicionPlazo()), i.isVencido() ? "Sí" : "No"
        )).toList());
    }

    private String s(Object o) {
        return o != null ? o.toString() : "";
    }
}
