package edu.unt.ingenieria_industrial.sgpp.core.reporte.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.ValidacionSede;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteComite;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteEstado;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteObservacion;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteComiteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteEstadoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.model.ControlPlazo;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.repository.ControlPlazoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.domain.ReporteDominio;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.repository.ReporteConsultaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.service.ReporteService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.CondicionSubsanacionFiltro;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoSalidaReporte;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;
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
public class ReporteServiceImpl implements ReporteService {

    private final ReporteConsultaRepository reporteRepository;
    private final ExpedienteComiteRepository comiteRepository;
    private final ExpedienteEstadoRepository estadoRepository;
    private final ControlPlazoRepository controlPlazoRepository;

    @Override
    public ReporteResultadoDTO<ExpedienteActivoItemDTO> generarExpedientesActivos(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizarFiltros(filtros);
        LocalDate hoy = LocalDate.now();

        List<Expediente> expedientes = reporteRepository.buscarExpedientesActivos(
                f.getPeriodoAcademico(), f.getCodigoTipoPractica(), f.getEstadoExpediente(),
                f.getIdEmpresa(), f.getIdSede(), f.getIdAsesor(), f.getIdComiteUsuario(),
                f.getConvenioVigente(), f.getFechaDesde(), f.getFechaHasta(), hoy);

        List<ExpedienteActivoItemDTO> registros = expedientes.stream()
                .map(this::mapearExpedienteActivo)
                .toList();

        ResumenDashboardDTO resumen = construirResumenExpedientes(registros.size(), expedientes);

        return construirResultado(
                TipoReporte.EXPEDIENTES_ACTIVOS,
                "Expedientes activos",
                "Expedientes en curso que aún no han concluido su flujo documental ni acreditación final.",
                f, resumen, aplicarFormato(registros, f.getFormato()), registros.size());
    }

    @Override
    public ReporteResultadoDTO<ExpedienteCerradoItemDTO> generarExpedientesCerrados(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizarFiltros(filtros);

        List<Expediente> expedientes = reporteRepository.buscarExpedientesCerrados(
                f.getPeriodoAcademico(), f.getCodigoTipoPractica(),
                f.getIdEmpresa(), f.getIdSede(), f.getIdAsesor(), f.getIdComiteUsuario(),
                f.getFechaDesde(), f.getFechaHasta());

        List<ExpedienteCerradoItemDTO> registros = expedientes.stream()
                .map(this::mapearExpedienteCerrado)
                .toList();

        ResumenDashboardDTO resumen = construirResumenExpedientes(registros.size(), expedientes);

        return construirResultado(
                TipoReporte.EXPEDIENTES_CERRADOS,
                "Expedientes cerrados",
                "Expedientes concluidos satisfactoriamente con acreditación final de la práctica.",
                f, resumen, aplicarFormato(registros, f.getFormato()), registros.size());
    }

    @Override
    public ReporteResultadoDTO<PracticaPorTipoItemDTO> generarPracticasPorTipo(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizarFiltros(filtros);

        List<TipoPractica> tipos = reporteRepository.buscarTiposPracticaActivos(f.getCodigoTipoPractica());

        List<PracticaPorTipoItemDTO> registros = tipos.stream().map(tp -> {
            Map<String, Long> distribucion = reporteRepository
                    .distribucionEstadosPorTipo(tp.getId(), f.getPeriodoAcademico())
                    .stream()
                    .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));

            return PracticaPorTipoItemDTO.builder()
                    .codigoTipoPractica(tp.getCodigo())
                    .nombreTipoPractica(tp.getNombre())
                    .horasRequeridas(tp.getHorasRequeridas())
                    .totalExpedientes(reporteRepository.contarExpedientesPorTipo(
                            tp.getId(), f.getPeriodoAcademico(), f.getIdEmpresa(),
                            f.getFechaDesde(), f.getFechaHasta()))
                    .expedientesActivos(reporteRepository.contarActivosPorTipo(tp.getId(), f.getPeriodoAcademico()))
                    .expedientesCerrados(reporteRepository.contarCerradosPorTipo(tp.getId(), f.getPeriodoAcademico()))
                    .enEjecucion(distribucion.getOrDefault("EN_EJECUCION", 0L))
                    .conObservaciones(distribucion.getOrDefault("OBSERVADO", 0L))
                    .distribucionPorEstado(distribucion)
                    .build();
        }).toList();

        ResumenDashboardDTO resumen = ResumenDashboardDTO.builder()
                .totalRegistros(registros.size())
                .conteoPorTipoPractica(registros.stream()
                        .collect(Collectors.toMap(
                                PracticaPorTipoItemDTO::getCodigoTipoPractica,
                                PracticaPorTipoItemDTO::getTotalExpedientes)))
                .build();

        return construirResultado(
                TipoReporte.PRACTICAS_POR_TIPO,
                "Prácticas por tipo",
                "Clasificación institucional por tipo de práctica (inicial, final, profesional) basada en el catálogo de negocio.",
                f, resumen, aplicarFormato(registros, f.getFormato()), registros.size());
    }

    @Override
    public ReporteResultadoDTO<EmpresaReceptoraItemDTO> generarEmpresasReceptoras(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizarFiltros(filtros);
        LocalDate hoy = LocalDate.now();

        List<Empresa> empresas = reporteRepository.buscarEmpresasReceptoras(
                f.getPeriodoAcademico(), f.getCodigoTipoPractica(), f.getIdEmpresa(),
                f.getFechaDesde(), f.getFechaHasta());

        List<EmpresaReceptoraItemDTO> registros = empresas.stream().map(emp -> {
            List<String> convenios = reporteRepository.numerosConvenioVigentesPorEmpresa(emp.getId(), hoy);
            return EmpresaReceptoraItemDTO.builder()
                    .idEmpresa(emp.getId())
                    .ruc(emp.getRuc())
                    .razonSocial(emp.getRazonSocial())
                    .nombreComercial(emp.getNombreComercial())
                    .sectorEconomico(emp.getSectorEconomico())
                    .validada(Boolean.TRUE.equals(emp.getValidado()))
                    .totalExpedientes(reporteRepository.contarExpedientesPorEmpresa(
                            emp.getId(), f.getPeriodoAcademico(), f.getCodigoTipoPractica()))
                    .expedientesActivos(reporteRepository.contarExpedientesActivosPorEmpresa(
                            emp.getId(), f.getPeriodoAcademico()))
                    .tiposPracticaAtendidos(reporteRepository.tiposPracticaPorEmpresa(
                            emp.getId(), f.getPeriodoAcademico()))
                    .conveniosVigentes(reporteRepository.contarConveniosVigentesPorEmpresa(emp.getId(), hoy))
                    .numerosConvenio(convenios)
                    .sedesAsociadas(reporteRepository.contarSedesPorEmpresa(emp.getId()))
                    .sedesValidadasVigentes(reporteRepository.contarSedesValidadasVigentesPorEmpresa(emp.getId(), hoy))
                    .build();
        }).toList();

        ResumenDashboardDTO resumen = ResumenDashboardDTO.builder()
                .totalRegistros(registros.size())
                .build();

        return construirResultado(
                TipoReporte.EMPRESAS_RECEPTORAS,
                "Empresas receptoras",
                "Consolidado de entidades donde los estudiantes realizan prácticas, con vínculo a convenios y sedes validadas.",
                f, resumen, aplicarFormato(registros, f.getFormato()), registros.size());
    }

    @Override
    public ReporteResultadoDTO<SedeValidadaItemDTO> generarSedesValidadas(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizarFiltros(filtros);
        LocalDate hoy = LocalDate.now();

        List<ValidacionSede> validaciones = reporteRepository.buscarValidacionesSede(
                f.getIdSede(), f.getIdEmpresa(), f.getFechaDesde(), f.getFechaHasta());

        Map<Long, ValidacionSede> ultimaPorSede = new LinkedHashMap<>();
        for (ValidacionSede v : validaciones) {
            ultimaPorSede.putIfAbsent(v.getSede().getId(), v);
        }

        List<SedeValidadaItemDTO> registros = ultimaPorSede.values().stream()
                .map(v -> mapearSedeValidada(v, hoy))
                .filter(item -> item.isVigente() || f.getFechaDesde() != null || f.getFechaHasta() != null)
                .toList();

        ResumenDashboardDTO resumen = ResumenDashboardDTO.builder()
                .totalRegistros(registros.size())
                .sedesValidadasVigentes(registros.stream().filter(SedeValidadaItemDTO::isVigente).count())
                .build();

        return construirResultado(
                TipoReporte.SEDES_VALIDADAS,
                "Sedes validadas",
                "Sedes habilitadas según el registro institucional de validación del comité, con vigencia y vínculo a expedientes.",
                f, resumen, aplicarFormato(registros, f.getFormato()), registros.size());
    }

    @Override
    public ReporteResultadoDTO<ConvenioVigenteItemDTO> generarConveniosVigentes(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizarFiltros(filtros);
        LocalDate hoy = LocalDate.now();

        Boolean filtroVigencia = f.getConvenioVigente() != null ? f.getConvenioVigente() : Boolean.TRUE;

        List<Convenio> convenios = reporteRepository.buscarConvenios(
                f.getIdEmpresa(), filtroVigencia, f.getFechaDesde(), f.getFechaHasta(), hoy);

        List<ConvenioVigenteItemDTO> registros = convenios.stream()
                .map(c -> mapearConvenio(c, hoy))
                .toList();

        ResumenDashboardDTO resumen = ResumenDashboardDTO.builder()
                .totalRegistros(registros.size())
                .conveniosVigentes(registros.stream().filter(ConvenioVigenteItemDTO::isVigente).count())
                .build();

        return construirResultado(
                TipoReporte.CONVENIOS_VIGENTES,
                "Convenios vigentes",
                "Empresas e instituciones con convenio activo o acuerdo preliminar válido para la ejecución de prácticas.",
                f, resumen, aplicarFormato(registros, f.getFormato()), registros.size());
    }

    @Override
    public ReporteResultadoDTO<SubsanacionPendienteItemDTO> generarSubsanacionesPendientes(ReporteFiltroDTO filtros) {
        ReporteFiltroDTO f = normalizarFiltros(filtros);
        LocalDate hoy = LocalDate.now();

        List<ExpedienteObservacion> observaciones = reporteRepository.buscarObservacionesPendientes(
                f.getPeriodoAcademico(), f.getCodigoTipoPractica(), f.getEstadoExpediente(),
                f.getIdEmpresa(), f.getIdAsesor());

        List<SubsanacionPendienteItemDTO> registros = observaciones.stream()
                .map(obs -> mapearSubsanacionPendiente(obs, hoy))
                .filter(item -> cumpleFiltroSubsanacion(item, f.getCondicionSubsanacion()))
                .toList();

        long vencidas = registros.stream().filter(SubsanacionPendienteItemDTO::isVencido).count();

        ResumenDashboardDTO resumen = ResumenDashboardDTO.builder()
                .totalRegistros(registros.size())
                .subsanacionesPendientes(registros.size())
                .subsanacionesVencidas(vencidas)
                .build();

        return construirResultado(
                TipoReporte.SUBSANACIONES_PENDIENTES,
                "Estudiantes pendientes de subsanación",
                "Expedientes y documentos con observaciones no levantadas, con plazos normativos de subsanación.",
                f, resumen, aplicarFormato(registros, f.getFormato()), registros.size());
    }

    @Override
    public ReporteResultadoDTO<?> generarReporte(TipoReporte tipo, ReporteFiltroDTO filtros) {
        return switch (tipo) {
            case EXPEDIENTES_ACTIVOS -> generarExpedientesActivos(filtros);
            case EXPEDIENTES_CERRADOS -> generarExpedientesCerrados(filtros);
            case PRACTICAS_POR_TIPO -> generarPracticasPorTipo(filtros);
            case EMPRESAS_RECEPTORAS -> generarEmpresasReceptoras(filtros);
            case SEDES_VALIDADAS -> generarSedesValidadas(filtros);
            case CONVENIOS_VIGENTES -> generarConveniosVigentes(filtros);
            case SUBSANACIONES_PENDIENTES -> generarSubsanacionesPendientes(filtros);
        };
    }

    @Override
    public ResumenDashboardDTO obtenerResumenEjecutivo(ReporteFiltroDTO filtros) {
        LocalDate hoy = LocalDate.now();
        return ResumenDashboardDTO.builder()
                .expedientesActivos(reporteRepository.contarTotalExpedientesActivos())
                .expedientesCerrados(reporteRepository.contarTotalExpedientesCerrados())
                .subsanacionesPendientes(reporteRepository.contarObservacionesPendientes())
                .conveniosVigentes(reporteRepository.contarConveniosVigentes(hoy))
                .sedesValidadasVigentes(reporteRepository.contarSedesValidadasVigentes(hoy))
                .build();
    }

    private ExpedienteActivoItemDTO mapearExpedienteActivo(Expediente e) {
        List<String> comite = comiteRepository.findByExpedienteIdAndActivoTrue(e.getId()).stream()
                .map(ExpedienteComite::getUsuario)
                .map(this::nombreCompleto)
                .toList();

        return ExpedienteActivoItemDTO.builder()
                .idExpediente(e.getId())
                .codigoExpediente(e.getCodigoExpediente())
                .estadoActual(e.getEstado())
                .etapaFlujo(describirEtapa(e.getEstado()))
                .codigoTipoPractica(e.getTipoPractica().getCodigo())
                .nombreTipoPractica(e.getTipoPractica().getNombre())
                .periodoAcademico(e.getPeriodoAcademico())
                .condicionSolicitante(e.getCondicionSolicitante())
                .idEstudiante(e.getEstudiante().getId())
                .codigoEstudiantil(e.getEstudiante().getCodigoEstudiantil())
                .nombreEstudiante(nombreCompleto(e.getEstudiante().getUsuario()))
                .idEmpresa(e.getEmpresa() != null ? e.getEmpresa().getId() : null)
                .razonSocialEmpresa(e.getEmpresa() != null ? e.getEmpresa().getRazonSocial() : null)
                .idSede(e.getSedePractica() != null ? e.getSedePractica().getId() : null)
                .nombreSede(e.getSedePractica() != null ? e.getSedePractica().getNombreSede() : null)
                .idAsesor(e.getAsesor() != null ? e.getAsesor().getId() : null)
                .nombreAsesor(e.getAsesor() != null ? nombreCompleto(e.getAsesor()) : null)
                .miembrosComite(comite)
                .fechaInicioPractica(e.getFechaInicioPractica())
                .fechaFinPractica(e.getFechaFinPractica())
                .build();
    }

    private ExpedienteCerradoItemDTO mapearExpedienteCerrado(Expediente e) {
        Optional<ExpedienteEstado> cierre = estadoRepository.findByExpedienteIdOrderByFechaCambioAsc(e.getId())
                .stream()
                .filter(est -> ReporteDominio.ESTADO_CERRADO.equals(est.getEstadoNuevo()))
                .reduce((first, second) -> second);

        return ExpedienteCerradoItemDTO.builder()
                .idExpediente(e.getId())
                .codigoExpediente(e.getCodigoExpediente())
                .estadoFinal(e.getEstado())
                .codigoTipoPractica(e.getTipoPractica().getCodigo())
                .nombreTipoPractica(e.getTipoPractica().getNombre())
                .periodoAcademico(e.getPeriodoAcademico())
                .condicionSolicitante(e.getCondicionSolicitante())
                .codigoEstudiantil(e.getEstudiante().getCodigoEstudiantil())
                .nombreEstudiante(nombreCompleto(e.getEstudiante().getUsuario()))
                .razonSocialEmpresa(e.getEmpresa() != null ? e.getEmpresa().getRazonSocial() : null)
                .nombreSede(e.getSedePractica() != null ? e.getSedePractica().getNombreSede() : null)
                .nombreAsesor(e.getAsesor() != null ? nombreCompleto(e.getAsesor()) : null)
                .fechaInicioPractica(e.getFechaInicioPractica())
                .fechaFinPractica(e.getFechaFinPractica())
                .calificacionFinal(e.getCalificacionFinal())
                .informeFinalPresentado(e.getInformeFinalPresentado())
                .fechaCierre(cierre.map(ExpedienteEstado::getFechaCambio).orElse(e.getFechaActualizacion()))
                .motivoCierre(cierre.map(ExpedienteEstado::getObservacion).orElse("Cierre institucional del expediente"))
                .build();
    }

    private SedeValidadaItemDTO mapearSedeValidada(ValidacionSede v, LocalDate hoy) {
        boolean vigente = ReporteDominio.VALIDACION_SEDE_APROBADA.equals(v.getResultadoValidacion())
                && !hoy.isBefore(v.getFechaVigenciaDesde())
                && !hoy.isAfter(v.getFechaVigenciaHasta());

        return SedeValidadaItemDTO.builder()
                .idSede(v.getSede().getId())
                .nombreSede(v.getSede().getNombreSede())
                .direccion(v.getSede().getDireccion())
                .estadoSede(v.getSede().getEstadoSede())
                .idEmpresa(v.getSede().getEmpresa().getId())
                .razonSocialEmpresa(v.getSede().getEmpresa().getRazonSocial())
                .idValidacion(v.getId())
                .resultadoValidacion(v.getResultadoValidacion())
                .fechaVigenciaDesde(v.getFechaVigenciaDesde())
                .fechaVigenciaHasta(v.getFechaVigenciaHasta())
                .vigente(vigente)
                .fechaValidacion(v.getFechaValidacion())
                .validador(nombreCompleto(v.getUsuarioValidador()))
                .expedientesVinculados(reporteRepository.contarExpedientesPorSede(v.getSede().getId()))
                .expedientesActivos(reporteRepository.contarExpedientesActivosPorSede(v.getSede().getId()))
                .build();
    }

    private ConvenioVigenteItemDTO mapearConvenio(Convenio c, LocalDate hoy) {
        boolean vigente = Boolean.TRUE.equals(c.getVigente()) && Boolean.TRUE.equals(c.getActivo())
                && !c.getFechaFin().isBefore(hoy);

        String estadoVigencia;
        if (!Boolean.TRUE.equals(c.getVigente())) {
            estadoVigencia = "NO_VIGENTE";
        } else if (c.getFechaFin().isBefore(hoy)) {
            estadoVigencia = "VENCIDO";
        } else if (c.getFechaFin().isBefore(hoy.plusDays(30))) {
            estadoVigencia = "POR_VENCER";
        } else {
            estadoVigencia = "VIGENTE";
        }

        return ConvenioVigenteItemDTO.builder()
                .idConvenio(c.getId())
                .numeroConvenio(c.getNumeroConvenio())
                .idEmpresa(c.getEmpresa().getId())
                .razonSocialEmpresa(c.getEmpresa().getRazonSocial())
                .rucEmpresa(c.getEmpresa().getRuc())
                .fechaInicio(c.getFechaInicio())
                .fechaFin(c.getFechaFin())
                .vigente(vigente)
                .estadoVigencia(estadoVigencia)
                .objetivo(c.getObjetivo())
                .expedientesEnEjecucion(reporteRepository.contarExpedientesEnEjecucionPorConvenio(c.getId()))
                .totalExpedientesAsociados(reporteRepository.contarExpedientesPorConvenio(c.getId()))
                .build();
    }

    private SubsanacionPendienteItemDTO mapearSubsanacionPendiente(ExpedienteObservacion obs, LocalDate hoy) {
        Expediente e = obs.getExpediente();
        ControlPlazo plazo = controlPlazoRepository
                .findTopByExpedienteIdAndReglaPlazoCodigoAndEstadoInOrderByFechaCreacionDesc(
                        e.getId(),
                        ReporteDominio.REGLA_PLAZO_SUBSANACION,
                        List.of(ReporteDominio.ESTADO_PLAZO_VIGENTE, ReporteDominio.ESTADO_PLAZO_PROXIMO_VENCER))
                .orElse(null);

        LocalDate fechaLimite = plazo != null ? plazo.getFechaLimite() : null;
        boolean vencido = fechaLimite != null && fechaLimite.isBefore(hoy);
        long diasRestantes = fechaLimite != null ? ChronoUnit.DAYS.between(hoy, fechaLimite) : 0;

        String condicionPlazo;
        if (fechaLimite == null) {
            condicionPlazo = "SIN_PLAZO_REGISTRADO";
        } else if (vencido) {
            condicionPlazo = "VENCIDO";
        } else if (diasRestantes <= 3) {
            condicionPlazo = "PROXIMO_VENCER";
        } else {
            condicionPlazo = "PENDIENTE";
        }

        return SubsanacionPendienteItemDTO.builder()
                .idObservacion(obs.getId())
                .idExpediente(e.getId())
                .codigoExpediente(e.getCodigoExpediente())
                .estadoExpediente(e.getEstado())
                .codigoEstudiantil(e.getEstudiante().getCodigoEstudiantil())
                .nombreEstudiante(nombreCompleto(e.getEstudiante().getUsuario()))
                .codigoTipoPractica(e.getTipoPractica().getCodigo())
                .tipoObservacion(obs.getTipo())
                .descripcionObservacion(obs.getDescripcion())
                .fechaObservacion(obs.getFechaCreacion())
                .fechaLimiteSubsanacion(fechaLimite)
                .condicionPlazo(condicionPlazo)
                .diasRestantes(diasRestantes)
                .vencido(vencido)
                .origenObservacion(nombreCompleto(obs.getUsuarioOrigen()))
                .build();
    }

    private boolean cumpleFiltroSubsanacion(SubsanacionPendienteItemDTO item, CondicionSubsanacionFiltro filtro) {
        if (filtro == null || filtro == CondicionSubsanacionFiltro.TODAS) {
            return true;
        }
        return switch (filtro) {
            case PENDIENTE -> "PENDIENTE".equals(item.getCondicionPlazo())
                    || "SIN_PLAZO_REGISTRADO".equals(item.getCondicionPlazo());
            case PROXIMO_VENCER -> "PROXIMO_VENCER".equals(item.getCondicionPlazo());
            case VENCIDO -> item.isVencido();
            default -> true;
        };
    }

    private ResumenDashboardDTO construirResumenExpedientes(long total, List<Expediente> expedientes) {
        Map<String, Long> porEstado = expedientes.stream()
                .collect(Collectors.groupingBy(Expediente::getEstado, Collectors.counting()));
        Map<String, Long> porTipo = expedientes.stream()
                .collect(Collectors.groupingBy(e -> e.getTipoPractica().getCodigo(), Collectors.counting()));
        Map<String, Long> porPeriodo = expedientes.stream()
                .filter(e -> e.getPeriodoAcademico() != null)
                .collect(Collectors.groupingBy(Expediente::getPeriodoAcademico, Collectors.counting()));

        return ResumenDashboardDTO.builder()
                .totalRegistros(total)
                .conteoPorEstado(porEstado)
                .conteoPorTipoPractica(porTipo)
                .conteoPorPeriodo(porPeriodo)
                .build();
    }

    private <T> List<T> aplicarFormato(List<T> registros, FormatoSalidaReporte formato) {
        if (formato == FormatoSalidaReporte.RESUMEN) {
            return List.of();
        }
        return registros;
    }

    private <T> ReporteResultadoDTO<T> construirResultado(
            TipoReporte tipo, String titulo, String descripcion,
            ReporteFiltroDTO filtros, ResumenDashboardDTO resumen,
            List<T> registros, long total) {

        FormatoSalidaReporte formato = filtros.getFormato() != null
                ? filtros.getFormato() : FormatoSalidaReporte.COMPLETO;

        return ReporteResultadoDTO.<T>builder()
                .tipoReporte(tipo)
                .titulo(titulo)
                .descripcion(descripcion)
                .filtrosAplicados(filtros)
                .resumen(formato == FormatoSalidaReporte.TABLA ? null : resumen)
                .registros(registros)
                .totalRegistros(total)
                .generadoEn(LocalDateTime.now())
                .build();
    }

    private ReporteFiltroDTO normalizarFiltros(ReporteFiltroDTO filtros) {
        if (filtros == null) {
            return ReporteFiltroDTO.builder().formato(FormatoSalidaReporte.COMPLETO).build();
        }
        if (filtros.getFormato() == null) {
            filtros.setFormato(FormatoSalidaReporte.COMPLETO);
        }
        if (filtros.getCondicionSubsanacion() == null) {
            filtros.setCondicionSubsanacion(CondicionSubsanacionFiltro.TODAS);
        }
        return filtros;
    }

    private String nombreCompleto(Usuario u) {
        if (u == null) return null;
        String materno = u.getApellidoMaterno() != null ? " " + u.getApellidoMaterno() : "";
        return u.getNombres() + " " + u.getApellidoPaterno() + materno;
    }

    private String describirEtapa(String estado) {
        if (estado == null) return "DESCONOCIDA";
        return switch (estado) {
            case "SOLICITADO" -> "Solicitud registrada";
            case "EMPRESA_SEDE_ASIGNADA" -> "Empresa y sede asignadas";
            case "CARTA_ACEPTACION_PRESENTADA" -> "Carta de aceptación presentada";
            case "ASESOR_ASIGNADO" -> "Asesor académico asignado";
            case "COMITE_ASIGNADO" -> "Comité de prácticas asignado";
            case "PLAN_PRESENTADO" -> "Plan de trabajo presentado";
            case "EN_REVISION" -> "Plan en revisión";
            case "OBSERVADO" -> "Con observaciones pendientes";
            case "SUBSANADO" -> "Observaciones subsanadas";
            case "APROBADO" -> "Plan aprobado";
            case "EN_EJECUCION" -> "Práctica en ejecución";
            case "INFORME_PARCIAL_PRESENTADO" -> "Informe parcial presentado";
            case "INFORME_FINAL_PRESENTADO" -> "Informe final presentado";
            case "INFORME_FINAL_APROBADO" -> "Informe final aprobado";
            case "EVALUADO" -> "Evaluación registrada";
            default -> estado;
        };
    }
}
