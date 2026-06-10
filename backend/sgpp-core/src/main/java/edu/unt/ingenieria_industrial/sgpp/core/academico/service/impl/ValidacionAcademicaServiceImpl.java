package edu.unt.ingenieria_industrial.sgpp.core.academico.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.academico.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.academico.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.academico.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.academico.service.ValidacionAcademicaService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.Practica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.PracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.EstadoAcademico;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ValidacionAcademicaServiceImpl implements ValidacionAcademicaService {

    private static final Logger log = LoggerFactory.getLogger(ValidacionAcademicaServiceImpl.class);

    private final EstudianteRepository estudianteRepository;
    private final TipoPracticaRepository tipoPracticaRepository;
    private final PracticaRepository practicaRepository;
    private final NormaValidacionRepository normaRepository;
    private final ReglaValidacionRepository reglaRepository;
    private final ParametroReglaRepository parametroRepository;
    private final ResultadoValidacionRepository resultadoRepository;
    private final DetalleValidacionRepository detalleRepository;

    @Override
    @Transactional
    public ValidacionAcademicaResponse validarEstudiante(ValidacionAcademicaRequest request) {
        Estudiante estudiante = estudianteRepository.findById(request.getEstudianteId())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante", "id", request.getEstudianteId()));

        TipoPractica tipoPractica = tipoPracticaRepository.findByCodigo(request.getCodigoTipoPractica())
                .orElseThrow(() -> new BusinessException(
                        "Tipo de práctica no encontrado: " + request.getCodigoTipoPractica()));

        List<NormaValidacion> normasAplicables = determinarNormasAplicables(
                request.getCodigoTipoPractica());

        if (normasAplicables.isEmpty()) {
            throw new BusinessException(
                    "No hay normas de validación vigentes para " + tipoPractica.getNombre());
        }

        List<ReglaValidacion> reglas = cargarReglasConNormas(
                request.getCodigoTipoPractica(), normasAplicables);

        if (reglas.isEmpty()) {
            throw new BusinessException(
                    "No hay reglas de validación configuradas para " + tipoPractica.getNombre());
        }

        Map<Long, List<ParametroRegla>> parametrosPorRegla = cargarParametrosBatch(reglas);

        List<DetalleValidacionDTO> detalles = new ArrayList<>();
        boolean apto = true;
        List<String> observaciones = new ArrayList<>();
        List<String> requisitosFaltantes = new ArrayList<>();

        for (ReglaValidacion regla : reglas) {
            List<ParametroRegla> parametros = parametrosPorRegla
                    .getOrDefault(regla.getId(), Collections.emptyList());

            ResultadoEvaluacion resultado = evaluarRegla(estudiante, regla, parametros);

            if (!resultado.cumplido()) {
                observaciones.add(resultado.observacion());
                if (resultado.esErrorEvaluacion()) {
                    log.warn("Regla {} (id={}) no pudo evaluarse: {}",
                            regla.getCodigo(), regla.getId(), resultado.observacion());
                }
                if (regla.getObligatorio()) {
                    apto = false;
                    if (resultado.requisitoFaltante() != null) {
                        requisitosFaltantes.add(resultado.requisitoFaltante());
                    }
                }
            }

            detalles.add(DetalleValidacionDTO.builder()
                    .codigoRegla(regla.getCodigo())
                    .nombreRegla(regla.getNombre())
                    .descripcion(regla.getDescripcion())
                    .obligatorio(regla.getObligatorio())
                    .cumplido(resultado.cumplido())
                    .observaciones(resultado.observacion())
                    .orden(regla.getOrden())
                    .build());
        }

        String observacionesGenerales = compilarObservaciones(apto, observaciones, tipoPractica.getNombre());

        ResultadoValidacion resultadoEntidad = ResultadoValidacion.builder()
                .estudiante(estudiante)
                .tipoPractica(tipoPractica)
                .norma(normasAplicables.get(0))
                .habilitado(apto)
                .periodoAcademico(request.getPeriodoAcademico())
                .fechaValidacion(LocalDateTime.now())
                .observacionesGenerales(observacionesGenerales)
                .build();

        resultadoEntidad = resultadoRepository.save(resultadoEntidad);

        List<ReglaValidacion> finalReglas = reglas;
        List<DetalleValidacionDTO> finalDetalles = detalles;
        guardarDetalles(resultadoEntidad, reglas, detalles);

        List<String> normasNombres = normasAplicables.stream()
                .map(NormaValidacion::getNombre)
                .collect(Collectors.toList());

        return buildResponse(resultadoEntidad, normasNombres, detalles, requisitosFaltantes);
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionAcademicaResponse obtenerResultadoPorId(Long id) {
        ResultadoValidacion resultado = resultadoRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ResultadoValidacion", "id", id));

        List<DetalleValidacion> detalles = detalleRepository
                .findWithReglaByResultadoValidacionIdOrderByOrdenAsc(id);

        return buildResponse(resultado, Collections.singletonList(resultado.getNorma().getNombre()),
                detalles.stream().map(this::toDetalleDTO).collect(Collectors.toList()),
                extraerRequisitosFaltantes(detalles));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ValidacionAcademicaResponse> listarResultadosPorEstudiante(Long estudianteId) {
        List<ResultadoValidacion> resultados = resultadoRepository
                .findByEstudianteIdOrderByFechaValidacionDesc(estudianteId);

        return resultados.stream().map(r -> {
            List<DetalleValidacion> detalles = detalleRepository
                    .findWithReglaByResultadoValidacionIdOrderByOrdenAsc(r.getId());
            return buildResponse(r, Collections.singletonList(r.getNorma().getNombre()),
                    detalles.stream().map(this::toDetalleDTO).collect(Collectors.toList()),
                    extraerRequisitosFaltantes(detalles));
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionAcademicaResponse obtenerUltimoResultado(Long estudianteId, String codigoTipoPractica) {
        TipoPractica tipoPractica = tipoPracticaRepository.findByCodigo(codigoTipoPractica)
                .orElseThrow(() -> new BusinessException("Tipo de práctica no encontrado: " + codigoTipoPractica));

        ResultadoValidacion resultado = resultadoRepository
                .findTopByEstudianteIdAndTipoPracticaIdAndActivoTrueOrderByFechaValidacionDesc(
                        estudianteId, tipoPractica.getId())
                .orElse(null);

        if (resultado == null) {
            return null;
        }

        List<DetalleValidacion> detalles = detalleRepository
                .findWithReglaByResultadoValidacionIdOrderByOrdenAsc(resultado.getId());

        return buildResponse(resultado, Collections.singletonList(resultado.getNorma().getNombre()),
                detalles.stream().map(this::toDetalleDTO).collect(Collectors.toList()),
                extraerRequisitosFaltantes(detalles));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReglaValidacionDTO> listarReglasPorTipoPractica(String codigoTipoPractica) {
        return reglaRepository.findByTipoPracticaCodigoAndActivoTrueOrderByOrdenAsc(codigoTipoPractica)
                .stream()
                .map(r -> ReglaValidacionDTO.builder()
                        .id(r.getId())
                        .codigo(r.getCodigo())
                        .nombre(r.getNombre())
                        .descripcion(r.getDescripcion())
                        .obligatorio(r.getObligatorio())
                        .orden(r.getOrden())
                        .idNorma(r.getNorma().getId())
                        .nombreNorma(r.getNorma().getNombre())
                        .codigoNorma(r.getNorma().getCodigo())
                        .idTipoPractica(r.getTipoPractica().getId())
                        .codigoTipoPractica(r.getTipoPractica().getCodigo())
                        .nombreTipoPractica(r.getTipoPractica().getNombre())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NormaValidacionDTO> listarNormasActivas() {
        LocalDate hoy = LocalDate.now();
        return normaRepository.findByActivoTrue().stream()
                .map(n -> NormaValidacionDTO.builder()
                        .id(n.getId())
                        .codigo(n.getCodigo())
                        .nombre(n.getNombre())
                        .descripcion(n.getDescripcion())
                        .fechaVigenciaInicio(n.getFechaVigenciaInicio())
                        .fechaVigenciaFin(n.getFechaVigenciaFin())
                        .activo(n.getActivo())
                        .vigente(esVigente(n, hoy))
                        .build())
                .collect(Collectors.toList());
    }

    private boolean esVigente(NormaValidacion n, LocalDate hoy) {
        return Boolean.TRUE.equals(n.getActivo())
                && !hoy.isBefore(n.getFechaVigenciaInicio())
                && (n.getFechaVigenciaFin() == null || !hoy.isAfter(n.getFechaVigenciaFin()));
    }

    private List<NormaValidacion> determinarNormasAplicables(String codigoTipoPractica) {
        List<String> codigosNormas = reglaRepository
                .findDistinctNormaCodigosByTipoPracticaCodigo(codigoTipoPractica);

        if (codigosNormas.isEmpty()) {
            return Collections.emptyList();
        }

        return normaRepository.findVigentesPorCodigos(codigosNormas, LocalDate.now());
    }

    private List<ReglaValidacion> cargarReglasConNormas(
            String codigoTipoPractica, List<NormaValidacion> normas) {
        Set<String> codigosNormas = normas.stream()
                .map(NormaValidacion::getCodigo)
                .collect(Collectors.toSet());

        return reglaRepository.findWithNormaByTipoPracticaAndNormas(codigoTipoPractica, codigosNormas);
    }

    private Map<Long, List<ParametroRegla>> cargarParametrosBatch(List<ReglaValidacion> reglas) {
        Set<Long> reglaIds = reglas.stream()
                .map(ReglaValidacion::getId)
                .collect(Collectors.toSet());

        List<ParametroRegla> todos = parametroRepository
                .findByReglaValidacionIdInAndActivoTrue(reglaIds);

        return todos.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getReglaValidacion().getId()));
    }

    private ResultadoEvaluacion evaluarRegla(Estudiante estudiante, ReglaValidacion regla,
                                              List<ParametroRegla> parametros) {
        try {
            return switch (regla.getCodigo()) {
                case "MATRICULA_ACTIVA" -> evaluarMatriculaActiva(estudiante);
                case "PRERREQUISITOS_APROBADOS" -> evaluarPrerrequisitos(estudiante, parametros);
                case "PPI_APROBADAS" -> evaluarPPIAprobadas(estudiante);
                case "CURSOS_HASTA_OCTAVO" -> evaluarSemestreMinimo(estudiante, parametros, 8);
                case "CURSOS_HASTA_NOVENO" -> evaluarSemestreMinimo(estudiante, parametros, 9);
                case "CREDITOS_MINIMOS" -> evaluarCreditosMinimos(estudiante, parametros);
                default -> {
                    log.warn("Regla de validación no reconocida: {} (id={})", regla.getCodigo(), regla.getId());
                    yield new ResultadoEvaluacion(false, true,
                            "Regla no implementada en el sistema: " + regla.getCodigo(),
                            "Configuración pendiente: " + regla.getNombre());
                }
            };
        } catch (Exception e) {
            log.error("Error al evaluar regla {} (id={}): {}", regla.getCodigo(), regla.getId(), e.getMessage(), e);
            return new ResultadoEvaluacion(false, true,
                    "Error interno al evaluar: " + e.getMessage(),
                    "Error de sistema en: " + regla.getNombre());
        }
    }

    private ResultadoEvaluacion evaluarMatriculaActiva(Estudiante estudiante) {
        boolean matriculado = estudiante.getEstadoAcademico() != null
                && (EstadoAcademico.MATRICULADO.equals(estudiante.getEstadoAcademico())
                    || EstadoAcademico.ACTIVO.equals(estudiante.getEstadoAcademico()));

        return new ResultadoEvaluacion(matriculado, false,
                matriculado
                        ? "Matrícula activa verificada (" + estudiante.getEstadoAcademico().getDescripcion() + ")"
                        : "El estudiante no tiene matrícula activa. Estado actual: "
                                + (estudiante.getEstadoAcademico() != null
                                    ? estudiante.getEstadoAcademico().getDescripcion()
                                    : "Sin estado registrado"),
                matriculado ? null : "Matricularse en el curso de Prácticas Pre Profesionales");
    }

    private ResultadoEvaluacion evaluarPrerrequisitos(Estudiante estudiante, List<ParametroRegla> parametros) {
        int creditosMinimos = buscarParametroInt(parametros, "CREDITOS_MINIMOS", 0);
        int creditos = estudiante.getCreditosAprobados() != null ? estudiante.getCreditosAprobados() : 0;
        boolean cumple = creditos >= creditosMinimos;

        return new ResultadoEvaluacion(cumple, false,
                cumple
                        ? "Prerrequisitos aprobados: " + creditos + " créditos (mínimo " + creditosMinimos + ")"
                        : "Créditos insuficientes: " + creditos + " de " + creditosMinimos + " requeridos",
                cumple ? null : "Aprobar " + (creditosMinimos - creditos) + " créditos adicionales");
    }

    private ResultadoEvaluacion evaluarPPIAprobadas(Estudiante estudiante) {
        List<Practica> practicas = practicaRepository.findByEstudianteId(estudiante.getId());

        TipoPractica tipoInicial = tipoPracticaRepository.findByCodigo("INICIAL").orElse(null);
        if (tipoInicial == null) {
            log.warn("Tipo de práctica con código 'INICIAL' no configurado en BD");
            return new ResultadoEvaluacion(false, true,
                    "No se pudo verificar prácticas iniciales: tipo INICIAL no configurado",
                    "Configurar tipo de práctica INICIAL en el sistema");
        }

        boolean tienePPIAprobada = practicas.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .filter(p -> p.getTipoPractica() != null)
                .anyMatch(p -> p.getTipoPractica().getId().equals(tipoInicial.getId())
                        && p.getEstado() != null
                        && "COMPLETADA".equals(p.getEstado().getCodigo()));

        return new ResultadoEvaluacion(tienePPIAprobada, false,
                tienePPIAprobada
                        ? "Prácticas Pre Profesionales Iniciales aprobadas"
                        : "No se encontraron Prácticas Pre Profesionales Iniciales completadas",
                tienePPIAprobada ? null : "Completar y aprobar las Prácticas Pre Profesionales Iniciales");
    }

    private ResultadoEvaluacion evaluarSemestreMinimo(Estudiante estudiante, List<ParametroRegla> parametros,
                                                       int semestreDefault) {
        int semestreMinimo = buscarParametroInt(parametros, "SEMESTRE_MINIMO", semestreDefault);
        int semestre = estudiante.getSemestreActual() != null ? estudiante.getSemestreActual() : 0;
        boolean cumple = semestre >= semestreMinimo;

        return new ResultadoEvaluacion(cumple, false,
                cumple
                        ? "Semestre cursado: " + semestre + " (mínimo requerido: " + semestreMinimo + ")"
                        : "Semestre insuficiente: " + semestre + " de " + semestreMinimo + " requeridos",
                cumple ? null : "Cursar hasta el " + semestreMinimo + "° ciclo");
    }

    private ResultadoEvaluacion evaluarCreditosMinimos(Estudiante estudiante, List<ParametroRegla> parametros) {
        int creditosMinimos = buscarParametroInt(parametros, "CREDITOS_MINIMOS", 0);
        int creditos = estudiante.getCreditosAprobados() != null ? estudiante.getCreditosAprobados() : 0;
        boolean cumple = creditos >= creditosMinimos;

        return new ResultadoEvaluacion(cumple, false,
                cumple
                        ? "Créditos aprobados: " + creditos + " (mínimo " + creditosMinimos + ")"
                        : "Créditos insuficientes: " + creditos + " de " + creditosMinimos,
                cumple ? null : "Aprobar " + (creditosMinimos - creditos) + " créditos más");
    }

    private int buscarParametroInt(List<ParametroRegla> parametros, String clave, int defaultValue) {
        return parametros.stream()
                .filter(p -> p.getClave().equals(clave) && p.getValor() != null)
                .findFirst()
                .map(p -> {
                    try {
                        return Integer.parseInt(p.getValor().trim());
                    } catch (NumberFormatException e) {
                        log.warn("Parámetro '{}' con valor no numérico: '{}'", clave, p.getValor());
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    private String compilarObservaciones(boolean apto, List<String> observaciones, String nombreTipoPractica) {
        if (observaciones.isEmpty()) {
            return "El estudiante cumple con todos los requisitos académicos para " + nombreTipoPractica;
        }
        if (apto) {
            return "El estudiante cumple los requisitos obligatorios, pero presenta observaciones: "
                    + String.join("; ", observaciones);
        }
        return "El estudiante NO cumple los requisitos obligatorios: " + String.join("; ", observaciones);
    }

    private void guardarDetalles(ResultadoValidacion resultado, List<ReglaValidacion> reglas,
                                  List<DetalleValidacionDTO> detallesDTO) {
        List<DetalleValidacion> detalles = new ArrayList<>(detallesDTO.size());
        for (int i = 0; i < detallesDTO.size(); i++) {
            DetalleValidacionDTO dto = detallesDTO.get(i);
            detalles.add(DetalleValidacion.builder()
                    .resultadoValidacion(resultado)
                    .reglaValidacion(reglas.get(i))
                    .cumplido(dto.getCumplido())
                    .observaciones(dto.getObservaciones())
                    .orden(i)
                    .build());
        }
        detalleRepository.saveAll(detalles);
    }

    private List<String> extraerRequisitosFaltantes(List<DetalleValidacion> detalles) {
        return detalles.stream()
                .filter(d -> !Boolean.TRUE.equals(d.getCumplido()))
                .filter(d -> Boolean.TRUE.equals(d.getReglaValidacion().getObligatorio()))
                .map(d -> d.getReglaValidacion().getNombre())
                .collect(Collectors.toList());
    }

    private ValidacionAcademicaResponse buildResponse(ResultadoValidacion resultado,
                                                       List<String> normasAplicadas,
                                                       List<DetalleValidacionDTO> detalles,
                                                       List<String> requisitosFaltantes) {
        int cumplidas = (int) detalles.stream().filter(DetalleValidacionDTO::getCumplido).count();
        int total = detalles.size();

        String nombreEstudiante = Optional.ofNullable(resultado.getEstudiante())
                .map(Estudiante::getUsuario)
                .map(u -> u.getNombres() + " " + u.getApellidoPaterno())
                .orElse("Desconocido");

        String codigoEstudiantil = Optional.ofNullable(resultado.getEstudiante())
                .map(Estudiante::getCodigoEstudiantil)
                .orElse("N/A");

        return ValidacionAcademicaResponse.builder()
                .idResultado(resultado.getId())
                .estudianteId(resultado.getEstudiante().getId())
                .nombreEstudiante(nombreEstudiante)
                .codigoEstudiantil(codigoEstudiantil)
                .tipoPractica(resultado.getTipoPractica().getNombre())
                .normasAplicadas(normasAplicadas)
                .periodoAcademico(resultado.getPeriodoAcademico())
                .apto(resultado.getHabilitado())
                .fechaValidacion(resultado.getFechaValidacion())
                .detalles(detalles)
                .observacionesGenerales(resultado.getObservacionesGenerales())
                .reglasCumplidas(cumplidas)
                .reglasIncumplidas(total - cumplidas)
                .totalReglas(total)
                .requisitosFaltantes(requisitosFaltantes)
                .build();
    }

    private DetalleValidacionDTO toDetalleDTO(DetalleValidacion detalle) {
        return DetalleValidacionDTO.builder()
                .codigoRegla(detalle.getReglaValidacion().getCodigo())
                .nombreRegla(detalle.getReglaValidacion().getNombre())
                .descripcion(detalle.getReglaValidacion().getDescripcion())
                .obligatorio(detalle.getReglaValidacion().getObligatorio())
                .cumplido(detalle.getCumplido())
                .observaciones(detalle.getObservaciones())
                .orden(detalle.getOrden())
                .build();
    }

    private record ResultadoEvaluacion(
            boolean cumplido,
            boolean esErrorEvaluacion,
            String observacion,
            String requisitoFaltante
    ) {}
}
