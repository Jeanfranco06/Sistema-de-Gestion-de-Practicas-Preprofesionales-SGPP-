package edu.unt.ingenieria_industrial.sgpp.core.dashboard.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.dashboard.domain.KpiCatalogo;
import edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.dashboard.repository.DashboardKpiRepository;
import edu.unt.ingenieria_industrial.sgpp.core.dashboard.service.DashboardKpiService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteEstado;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.CodigoKpi;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardKpiServiceImpl implements DashboardKpiService {

    private static final int LIMITE_EMPRESAS_DEFAULT = 10;

    private final DashboardKpiRepository kpiRepository;

    @Override
    public DashboardKpiConsolidadoDTO obtenerDashboardConsolidado(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizar(filtros);
        return DashboardKpiConsolidadoDTO.builder()
                .generadoEn(LocalDateTime.now())
                .expedientesPorTipo(kpiExpedientesPorTipo(f))
                .tiemposAprobacion(kpiTiemposAprobacion(f))
                .cumplimientoPlazos(kpiCumplimientoPlazos(f))
                .distribucionSedes(kpiDistribucionSedes(f))
                .empresasRecurrentes(kpiEmpresasRecurrentes(f, LIMITE_EMPRESAS_DEFAULT))
                .estadoObservaciones(kpiEstadoObservaciones(f))
                .build();
    }

    @Override
    public KpiResponseDTO<ExpedientesPorTipoKpiDTO> kpiExpedientesPorTipo(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizar(filtros);
        FiltroParams p = FiltroParams.from(f);

        List<Object[]> filas = kpiRepository.contarExpedientesPorTipo(
                p.periodo, p.tipoPractica, p.estado, p.idEmpresa, p.idSede, p.idAsesor,
                p.fechaDesde, p.fechaHasta);

        long total = 0;
        List<ExpedientesPorTipoKpiDTO.SegmentoTipoPractica> segmentos = new ArrayList<>();
        Map<String, Long> distribucion = new LinkedHashMap<>();

        for (Object[] row : filas) {
            long cantidad = (Long) row[2];
            long activos = ((Number) row[3]).longValue();
            long cerrados = ((Number) row[4]).longValue();
            total += cantidad;
            String codigo = (String) row[0];
            distribucion.put(codigo, cantidad);
            segmentos.add(ExpedientesPorTipoKpiDTO.SegmentoTipoPractica.builder()
                    .codigoTipoPractica(codigo)
                    .nombreTipoPractica((String) row[1])
                    .cantidad(cantidad)
                    .activos(activos)
                    .cerrados(cerrados)
                    .porcentaje(0)
                    .build());
        }

        final long totalFinal = total;
        segmentos.forEach(s -> s.setPorcentaje(totalFinal > 0
                ? Math.round(s.getCantidad() * 10000.0 / totalFinal) / 100.0 : 0));

        return envolver(CodigoKpi.EXPEDIENTES_POR_TIPO, f, ExpedientesPorTipoKpiDTO.builder()
                .totalExpedientes(total)
                .segmentos(segmentos)
                .distribucionPorCodigo(distribucion)
                .build());
    }

    @Override
    public KpiResponseDTO<TiemposAprobacionKpiDTO> kpiTiemposAprobacion(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizar(filtros);
        FiltroParams p = FiltroParams.from(f);

        List<Long> ids = kpiRepository.idsExpedientesFiltrados(
                p.periodo, p.tipoPractica, p.estado, p.idEmpresa, p.idSede, p.idAsesor,
                p.fechaDesde, p.fechaHasta);

        if (ids.isEmpty()) {
            return envolver(CodigoKpi.TIEMPOS_APROBACION, f, TiemposAprobacionKpiDTO.builder()
                    .expedientesAnalizados(0)
                    .aprobacionPlan(estadisticaVacia())
                    .aprobacionExpediente(estadisticaVacia())
                    .porEtapa(List.of())
                    .build());
        }

        List<ExpedienteEstado> historial = kpiRepository.historialEstadosPorExpedientes(ids);
        Map<Long, List<ExpedienteEstado>> porExpediente = historial.stream()
                .collect(Collectors.groupingBy(e -> e.getExpediente().getId()));

        List<Long> diasAprobacionPlan = new ArrayList<>();
        List<Long> diasAprobacionExpediente = new ArrayList<>();

        for (List<ExpedienteEstado> estados : porExpediente.values()) {
            estados.sort(Comparator.comparing(ExpedienteEstado::getFechaCambio));

            Optional<Long> plan = calcularDuracion(estados,
                    List.of("PLAN_PRESENTADO", "EN_REVISION"), "APROBADO");
            plan.ifPresent(diasAprobacionPlan::add);

            Optional<Long> global = calcularDuracion(estados,
                    List.of("SOLICITADO"), "APROBADO");
            global.ifPresent(diasAprobacionExpediente::add);
        }

        List<TiemposAprobacionKpiDTO.DetalleEtapa> etapas = List.of(
                detalleEtapa("Aprobación del plan", "PLAN_PRESENTADO/EN_REVISION", "APROBADO", diasAprobacionPlan),
                detalleEtapa("Aprobación integral", "SOLICITADO", "APROBADO", diasAprobacionExpediente)
        );

        return envolver(CodigoKpi.TIEMPOS_APROBACION, f, TiemposAprobacionKpiDTO.builder()
                .expedientesAnalizados(porExpediente.size())
                .aprobacionPlan(construirEstadisticas(diasAprobacionPlan))
                .aprobacionExpediente(construirEstadisticas(diasAprobacionExpediente))
                .porEtapa(etapas)
                .build());
    }

    @Override
    public KpiResponseDTO<CumplimientoPlazosKpiDTO> kpiCumplimientoPlazos(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizar(filtros);
        FiltroParams p = FiltroParams.from(f);
        LocalDate hoy = LocalDate.now();

        Map<String, Long> porEstado = kpiRepository.distribucionPlazosPorEstado(
                        p.periodo, p.tipoPractica, p.estado, p.idEmpresa, p.idSede, p.idAsesor,
                        p.fechaDesde, p.fechaHasta)
                .stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        long cumplidosEnPlazo = porEstado.getOrDefault("CUMPLIDO_EN_PLAZO", 0L);
        long cumplidosFuera = porEstado.getOrDefault("CUMPLIDO_FUERA_PLAZO", 0L);
        long vigentes = porEstado.getOrDefault("VIGENTE", 0L);
        long proximos = porEstado.getOrDefault("PROXIMO_A_VENCER", 0L);
        long vencidos = porEstado.getOrDefault("VENCIDO", 0L);
        long total = porEstado.values().stream().mapToLong(Long::longValue).sum();

        long cerrados = cumplidosEnPlazo + cumplidosFuera + vencidos;
        double tasa = cerrados > 0 ? Math.round(cumplidosEnPlazo * 10000.0 / cerrados) / 100.0 : 0;

        Map<String, Map<String, Long>> porReglaEstado = new LinkedHashMap<>();
        Map<String, String> nombresRegla = new LinkedHashMap<>();

        for (Object[] row : kpiRepository.plazosPorReglaYEstado(
                p.periodo, p.tipoPractica, p.estado, p.idEmpresa, p.idSede, p.idAsesor,
                p.fechaDesde, p.fechaHasta)) {
            String codigo = (String) row[0];
            nombresRegla.put(codigo, (String) row[1]);
            String estadoPlazo = (String) row[2];
            long count = (Long) row[3];
            porReglaEstado.computeIfAbsent(codigo, k -> new LinkedHashMap<>())
                    .merge(estadoPlazo, count, Long::sum);
        }

        List<CumplimientoPlazosKpiDTO.DetalleRegla> detalleReglas = porReglaEstado.entrySet().stream()
                .map(entry -> {
                    String codigo = entry.getKey();
                    Map<String, Long> estados = entry.getValue();
                    long reglaCumplidos = estados.getOrDefault("CUMPLIDO_EN_PLAZO", 0L);
                    long reglaVencidos = estados.getOrDefault("VENCIDO", 0L);
                    long reglaTotal = estados.values().stream().mapToLong(Long::longValue).sum();
                    long reglaCerrados = reglaCumplidos
                            + estados.getOrDefault("CUMPLIDO_FUERA_PLAZO", 0L) + reglaVencidos;
                    return CumplimientoPlazosKpiDTO.DetalleRegla.builder()
                            .codigoRegla(codigo)
                            .nombreRegla(nombresRegla.get(codigo))
                            .total(reglaTotal)
                            .cumplidos(reglaCumplidos)
                            .vencidos(reglaVencidos)
                            .tasaCumplimiento(reglaCerrados > 0
                                    ? Math.round(reglaCumplidos * 10000.0 / reglaCerrados) / 100.0 : 0)
                            .build();
                })
                .toList();

        List<CumplimientoPlazosKpiDTO.CasoRiesgo> riesgos = kpiRepository.plazosEnRiesgo(p.periodo).stream()
                .limit(20)
                .map(c -> CumplimientoPlazosKpiDTO.CasoRiesgo.builder()
                        .idExpediente(c.getExpediente().getId())
                        .codigoExpediente(c.getExpediente().getCodigoExpediente())
                        .codigoRegla(c.getReglaPlazo().getCodigo())
                        .estadoPlazo(c.getEstado())
                        .fechaLimite(c.getFechaLimite().toString())
                        .diasRestantes(ChronoUnit.DAYS.between(hoy, c.getFechaLimite()))
                        .build())
                .toList();

        return envolver(CodigoKpi.CUMPLIMIENTO_PLAZOS, f, CumplimientoPlazosKpiDTO.builder()
                .totalPlazos(total)
                .cumplidosEnPlazo(cumplidosEnPlazo)
                .cumplidosFueraPlazo(cumplidosFuera)
                .vigentes(vigentes)
                .proximosAVencer(proximos)
                .vencidos(vencidos)
                .tasaCumplimiento(tasa)
                .distribucionPorEstado(porEstado)
                .porRegla(detalleReglas)
                .casosEnRiesgo(riesgos)
                .build());
    }

    @Override
    public KpiResponseDTO<DistribucionSedesKpiDTO> kpiDistribucionSedes(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizar(filtros);
        FiltroParams p = FiltroParams.from(f);
        LocalDate hoy = LocalDate.now();

        List<Object[]> filas = kpiRepository.distribucionPorSede(
                p.periodo, p.tipoPractica, p.estado, p.idEmpresa, p.idSede, p.idAsesor,
                p.fechaDesde, p.fechaHasta);

        long totalConSede = filas.stream().mapToLong(r -> (Long) r[4]).sum();
        List<DistribucionSedesKpiDTO.SegmentoSede> segmentos = new ArrayList<>();

        for (Object[] row : filas) {
            Long idSede = (Long) row[0];
            long cantidad = (Long) row[4];
            long activos = ((Number) row[5]).longValue();
            segmentos.add(DistribucionSedesKpiDTO.SegmentoSede.builder()
                    .idSede(idSede)
                    .nombreSede((String) row[1])
                    .razonSocialEmpresa((String) row[2])
                    .departamento((String) row[3])
                    .sedeValidadaVigente(kpiRepository.sedeTieneValidacionVigente(idSede, hoy))
                    .totalExpedientes(cantidad)
                    .expedientesActivos(activos)
                    .porcentaje(totalConSede > 0 ? Math.round(cantidad * 10000.0 / totalConSede) / 100.0 : 0)
                    .build());
        }

        return envolver(CodigoKpi.DISTRIBUCION_SEDES, f, DistribucionSedesKpiDTO.builder()
                .totalExpedientesConSede(totalConSede)
                .sedesConExpedientes(segmentos.size())
                .sedesValidadasVigentes(kpiRepository.contarSedesValidadasVigentes(hoy))
                .segmentos(segmentos)
                .build());
    }

    @Override
    public KpiResponseDTO<EmpresasRecurrentesKpiDTO> kpiEmpresasRecurrentes(ReporteFiltroDTO filtros, Integer limite) {
        ReporteFiltroDTO f = normalizar(filtros);
        FiltroParams p = FiltroParams.from(f);
        LocalDate hoy = LocalDate.now();
        int top = limite != null && limite > 0 ? limite : LIMITE_EMPRESAS_DEFAULT;

        List<Object[]> filas = kpiRepository.rankingEmpresas(
                p.periodo, p.tipoPractica, p.estado, p.idEmpresa, p.idSede, p.idAsesor,
                p.fechaDesde, p.fechaHasta);

        long totalExpedientes = filas.stream().mapToLong(r -> (Long) r[3]).sum();
        List<EmpresasRecurrentesKpiDTO.RankingEmpresa> ranking = new ArrayList<>();
        int pos = 1;

        for (Object[] row : filas.stream().limit(top).toList()) {
            Long idEmpresa = (Long) row[0];
            long cantidad = (Long) row[3];
            ranking.add(EmpresasRecurrentesKpiDTO.RankingEmpresa.builder()
                    .posicion(pos++)
                    .idEmpresa(idEmpresa)
                    .ruc((String) row[1])
                    .razonSocial((String) row[2])
                    .totalExpedientes(cantidad)
                    .expedientesActivos(((Number) row[4]).longValue())
                    .porcentajeDelTotal(totalExpedientes > 0
                            ? Math.round(cantidad * 10000.0 / totalExpedientes) / 100.0 : 0)
                    .tiposPracticaAtendidos(kpiRepository.tiposPracticaPorEmpresa(idEmpresa, p.periodo))
                    .conveniosVigentes(kpiRepository.conveniosVigentesPorEmpresa(idEmpresa, hoy))
                    .build());
        }

        return envolver(CodigoKpi.EMPRESAS_RECURRENTES, f, EmpresasRecurrentesKpiDTO.builder()
                .totalEmpresas(filas.size())
                .ranking(ranking)
                .build());
    }

    @Override
    public KpiResponseDTO<EstadoObservacionesKpiDTO> kpiEstadoObservaciones(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizar(filtros);
        FiltroParams p = FiltroParams.from(f);

        Map<Boolean, Long> porSubsanado = kpiRepository.observacionesPorSubsanado(
                        p.periodo, p.tipoPractica, p.estado, p.idEmpresa, p.idSede, p.idAsesor,
                        p.fechaDesde, p.fechaHasta)
                .stream()
                .collect(Collectors.toMap(r -> (Boolean) r[0], r -> (Long) r[1]));

        long pendientes = porSubsanado.getOrDefault(false, 0L);
        long subsanadas = porSubsanado.getOrDefault(true, 0L);
        long total = pendientes + subsanadas;

        Map<String, Long> porTipo = kpiRepository.observacionesPendientesPorTipo(
                        p.periodo, p.tipoPractica, p.idEmpresa, p.idSede, p.idAsesor)
                .stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        Map<String, Long> porEstadoExp = kpiRepository.observacionesPendientesPorEstadoExpediente(
                        p.periodo, p.tipoPractica)
                .stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        long vencidas = kpiRepository.contarObservacionesVencidas(
                p.periodo, p.tipoPractica, p.idEmpresa, p.idSede, p.idAsesor);
        long enRevision = kpiRepository.contarObservacionesEnRevision(p.periodo);
        long proximas = kpiRepository.contarObservacionesProximasAVencer(p.periodo);

        double tasaSub = total > 0 ? Math.round(subsanadas * 10000.0 / total) / 100.0 : 0;

        return envolver(CodigoKpi.ESTADO_OBSERVACIONES, f, EstadoObservacionesKpiDTO.builder()
                .totalObservaciones(total)
                .pendientes(pendientes)
                .subsanadas(subsanadas)
                .vencidas(vencidas)
                .enRevision(enRevision)
                .proximasAVencer(proximas)
                .distribucionPorTipo(porTipo)
                .distribucionPorEstadoExpediente(porEstadoExp)
                .tasaSubsanacion(tasaSub)
                .build());
    }

    @Override
    public KpiResponseDTO<?> kpiPorCodigo(CodigoKpi codigo, ReporteFiltroDTO filtros, Integer limite) {
        return switch (codigo) {
            case EXPEDIENTES_POR_TIPO -> kpiExpedientesPorTipo(filtros);
            case TIEMPOS_APROBACION -> kpiTiemposAprobacion(filtros);
            case CUMPLIMIENTO_PLAZOS -> kpiCumplimientoPlazos(filtros);
            case DISTRIBUCION_SEDES -> kpiDistribucionSedes(filtros);
            case EMPRESAS_RECURRENTES -> kpiEmpresasRecurrentes(filtros, limite);
            case ESTADO_OBSERVACIONES -> kpiEstadoObservaciones(filtros);
        };
    }

    private <T> KpiResponseDTO<T> envolver(CodigoKpi codigo, ReporteFiltroDTO filtros, T datos) {
        return KpiResponseDTO.<T>builder()
                .metadata(KpiCatalogo.metadata(codigo))
                .filtrosAplicados(filtros)
                .datos(datos)
                .build();
    }

    private ReporteFiltroDTO normalizar(ReporteFiltroDTO filtros) {
        return filtros != null ? filtros : new ReporteFiltroDTO();
    }

    private Optional<Long> calcularDuracion(List<ExpedienteEstado> estados,
                                            List<String> estadosInicio, String estadoFin) {
        LocalDateTime inicio = null;
        for (ExpedienteEstado e : estados) {
            if (inicio == null && estadosInicio.contains(e.getEstadoNuevo())) {
                inicio = e.getFechaCambio();
            }
            if (inicio != null && estadoFin.equals(e.getEstadoNuevo())) {
                return Optional.of(ChronoUnit.DAYS.between(inicio.toLocalDate(), e.getFechaCambio().toLocalDate()));
            }
        }
        return Optional.empty();
    }

    private TiemposAprobacionKpiDTO.ResumenEstadistico construirEstadisticas(List<Long> dias) {
        if (dias.isEmpty()) return estadisticaVacia();
        List<Long> sorted = dias.stream().sorted().toList();
        return TiemposAprobacionKpiDTO.ResumenEstadistico.builder()
                .promedioDias(Math.round(sorted.stream().mapToLong(Long::longValue).average().orElse(0) * 100.0) / 100.0)
                .medianaDias((double) mediana(sorted))
                .minimoDias(sorted.get(0).intValue())
                .maximoDias(sorted.get(sorted.size() - 1).intValue())
                .muestras(sorted.size())
                .build();
    }

    private TiemposAprobacionKpiDTO.DetalleEtapa detalleEtapa(
            String etapa, String inicio, String fin, List<Long> dias) {
        TiemposAprobacionKpiDTO.ResumenEstadistico stats = construirEstadisticas(dias);
        return TiemposAprobacionKpiDTO.DetalleEtapa.builder()
                .etapa(etapa)
                .estadoInicio(inicio)
                .estadoFin(fin)
                .promedioDias(stats.getPromedioDias())
                .medianaDias(stats.getMedianaDias())
                .muestras(stats.getMuestras())
                .build();
    }

    private long mediana(List<Long> sorted) {
        int n = sorted.size();
        if (n % 2 == 0) {
            return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2;
        }
        return sorted.get(n / 2);
    }

    private TiemposAprobacionKpiDTO.ResumenEstadistico estadisticaVacia() {
        return TiemposAprobacionKpiDTO.ResumenEstadistico.builder()
                .promedioDias(0.0).medianaDias(0.0).minimoDias(0).maximoDias(0).muestras(0).build();
    }

    private record FiltroParams(
            String periodo, String tipoPractica, String estado,
            Long idEmpresa, Long idSede, Long idAsesor,
            LocalDate fechaDesde, LocalDate fechaHasta) {

        static FiltroParams from(ReporteFiltroDTO f) {
            return new FiltroParams(
                    f.getPeriodoAcademico(), f.getCodigoTipoPractica(), f.getEstadoExpediente(),
                    f.getIdEmpresa(), f.getIdSede(), f.getIdAsesor(),
                    f.getFechaDesde(), f.getFechaHasta());
        }
    }
}
