package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.EvaluacionService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EvaluacionServiceImpl implements EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final CriterioEvaluacionRepository criterioEvaluacionRepository;
    private final DetalleEvaluacionRepository detalleEvaluacionRepository;
    private final RubricaRepository rubricaRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ExpedienteAccesoService expedienteAccesoService;
    private final edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.ComponenteEvaluacionService componenteEvaluacionService;
    private final edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.NotaUnidadRepository notaUnidadRepository;

    private static final String[] CALIFICACIONES_CUALITATIVAS = {"Deficiente", "Regular", "Bueno", "Muy Bueno", "Excelente"};

    @Override
    public EvaluacionResponseDTO crearEvaluacion(EvaluacionRequestDTO request, Long idUsuario, Collection<String> roles) {
        Expediente expediente = expedienteRepository.findById(request.getIdExpediente())
                .orElseThrow(() -> new ResourceNotFoundException("Expediente", "id", request.getIdExpediente()));

        if ("EMPRESA".equals(request.getComponente())) {
            validarEvaluacionEmpresa(expediente, request, idUsuario, roles);
        }

        int puntajeTotal = request.getDetalles().stream()
                .mapToInt(DetalleEvaluacionRequestDTO::getPuntajeObtenido)
                .sum();

        String tipoCalificacion = determinarTipoCalificacion(expediente, request);

        Evaluacion evaluacionToSave = Evaluacion.builder()
                .expediente(expediente)
                .tipoEvaluador(request.getTipoEvaluador())
                .evaluadorId(request.getEvaluadorId())
                .componente(request.getComponente())
                .puntajeTotal(puntajeTotal)
                .comentarios(request.getComentarios())
                .fechaEvaluacion(request.getFechaEvaluacion() != null ? request.getFechaEvaluacion() : LocalDate.now())
                .horasRegistradas(request.getHorasRegistradas() != null ? request.getHorasRegistradas() : 0)
                .rutaConstancia(request.getRutaConstancia())
                .tipoCalificacion(tipoCalificacion)
                .calificacionCualitativa(request.getCalificacionCualitativa())
                .activo(true)
                .build();

        final Evaluacion evaluacion = evaluacionRepository.save(evaluacionToSave);

        List<DetalleEvaluacion> detalles = request.getDetalles().stream()
                .map(dto -> {
                    CriterioEvaluacion criterio = buscarCriterio(dto.getIdCriterio());
                    return DetalleEvaluacion.builder()
                            .evaluacion(evaluacion)
                            .criterio(criterio)
                            .puntajeObtenido(dto.getPuntajeObtenido())
                            .calificacionCualitativa(dto.getCalificacionCualitativa())
                            .comentarios(dto.getComentarios())
                            .build();
                })
                .collect(Collectors.toList());

        detalleEvaluacionRepository.saveAll(detalles);

        String tipoPractica = expediente.getTipoPractica() == null ? "" : expediente.getTipoPractica().getCodigo();

        // Sincronizar evaluación de empresa con el componente Anexo 4 correspondiente
        if ("EMPRESA".equals(request.getComponente()) && !"INICIAL".equals(tipoPractica)) {
            try {
                componenteEvaluacionService.registrarEvaluacion(
                        expediente.getId(),
                        "EMPRESA",
                        puntajeTotal,
                        request.getEvaluadorId(),
                        request.getTipoEvaluador(),
                        request.getComentarios());
            } catch (Exception e) {
                log.warn("No se pudo sincronizar componente EMPRESA para expediente {}: {}",
                        expediente.getId(), e.getMessage());
            }
        }

        BigDecimal promedio = calcularPromedioFinal(expediente.getId());
        String calificacionCualitativa = calcularCalificacionCualitativa(promedio.doubleValue(), evaluacion.getTipoCalificacion());

        return toResponse(evaluacion, detalles, promedio, calificacionCualitativa);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluacionResponseDTO obtenerEvaluacionPorId(Long id) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluación", "id", id));

        List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(id);
        BigDecimal promedio = calcularPromedioFinal(evaluacion.getExpediente().getId());
        String calificacionCualitativa = calcularCalificacionCualitativa(promedio.doubleValue(), evaluacion.getTipoCalificacion());

        return toResponse(evaluacion, detalles, promedio, calificacionCualitativa);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluacionResponseDTO> obtenerEvaluacionesPorPractica(Long idExpediente) {
        List<Evaluacion> evaluaciones = evaluacionRepository.findByExpedienteIdAndActivoTrue(idExpediente);
        BigDecimal promedio = calcularPromedioFinal(idExpediente);

        return evaluaciones.stream()
                .map(ev -> {
                    List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(ev.getId());
                    String calificacionCualitativa = calcularCalificacionCualitativa(promedio.doubleValue(), ev.getTipoCalificacion());
                    return toResponse(ev, detalles, promedio, calificacionCualitativa);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CriterioEvaluacionDTO> obtenerCriteriosPorTipoEvaluador(String componente) {
        List<CriterioEvaluacion> criterios = criterioEvaluacionRepository.findByComponenteAndActivoTrue(componente);
        log.info("Consultando criterios para componente: {}, encontrados: {}", componente, criterios.size());
        return criterios.stream()
                .map(this::toCriterioDTO)
                .collect(Collectors.toList());
    }

    private CriterioEvaluacion buscarCriterio(Object idCriterio) {
        if (idCriterio instanceof Number numId) {
            return criterioEvaluacionRepository.findById(numId.longValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Criterio de Evaluación", "id", numId));
        }
        String codigo = String.valueOf(idCriterio);
        return criterioEvaluacionRepository.findByCodigoAndActivoTrue(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Criterio de Evaluación", "codigo", codigo));
    }

    private void validarEvaluacionEmpresa(Expediente expediente, EvaluacionRequestDTO request,
                                          Long idUsuario, Collection<String> roles) {
        if (!"EMPRESA".equals(request.getTipoEvaluador())) {
            throw new BusinessException("La evaluación de empresa debe registrar el tipo de evaluador EMPRESA");
        }
        String tipoPractica = expediente.getTipoPractica() == null ? "" : expediente.getTipoPractica().getCodigo();
        if ("INICIAL".equals(tipoPractica)) {
            throw new BusinessException("La evaluación de empresa solo aplica a prácticas finales o profesionales");
        }
        if (!roles.contains("TUTOR_EXTERNO") && !roles.contains("ADMIN_SISTEMA")
                && !roles.contains("COORDINADOR") && !roles.contains("DIRECTOR")) {
            throw new BusinessException("Solo el tutor externo asignado puede registrar la evaluación de empresa");
        }
        if (roles.contains("TUTOR_EXTERNO")) {
            expedienteAccesoService.verificarLectura(expediente, idUsuario, roles);
        }
        if (!Set.of("INFORME_FINAL_PRESENTADO", "INFORME_APROBADO").contains(expediente.getEstado())) {
            throw new BusinessException("La evaluación de empresa se habilita al presentar el informe final");
        }

        Set<Long> criteriosRecibidos = new HashSet<>();
        for (DetalleEvaluacionRequestDTO detalle : request.getDetalles()) {
            CriterioEvaluacion criterio = buscarCriterio(detalle.getIdCriterio());
            if (!"EMPRESA".equals(criterio.getComponente())) {
                throw new BusinessException("Solo se permiten criterios de evaluación de empresa");
            }
            if (!criteriosRecibidos.add(criterio.getId())) {
                throw new BusinessException("No se puede registrar un criterio más de una vez");
            }
            boolean esCualitativa = "CUALITATIVA".equals(request.getTipoCalificacion());
            if (!esCualitativa && (detalle.getPuntajeObtenido() < 1 || detalle.getPuntajeObtenido() > criterio.getPuntajeMaximo())) {
                throw new BusinessException("Cada criterio de empresa debe tener un puntaje válido");
            }
        }
        int criteriosEsperados = criterioEvaluacionRepository.findByComponenteAndActivoTrue("EMPRESA").size();
        if (criteriosRecibidos.size() != criteriosEsperados) {
            throw new BusinessException("Debe completar todos los criterios de evaluación de empresa");
        }
    }

    private BigDecimal calcularPromedioFinal(Long idExpediente) {
        // Prioridad 1: notas por unidades para prácticas iniciales (curriculares).
        try {
            List<edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.NotaUnidad> notas =
                    notaUnidadRepository.findByExpedienteIdAndActivoTrueOrderByNumeroUnidadAsc(idExpediente);
            if (notas.size() >= 3) {
                BigDecimal promedio = notas.stream()
                        .map(n -> n.getNotaFinalUnidad() != null ? n.getNotaFinalUnidad() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
                return promedio;
            }
        } catch (Exception e) {
            log.debug("No se pudieron consultar notas por unidad para expediente {}: {}", idExpediente, e.getMessage());
        }

        // Prioridad 2: componentes Anexo 4 para prácticas finales/profesionales.
        try {
            List<edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.ComponenteEvaluacion> componentes =
                    componenteEvaluacionService.obtenerComponentesPorExpediente(idExpediente).stream()
                            .map(dto -> {
                                edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.ComponenteEvaluacion c =
                                        new edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.ComponenteEvaluacion();
                                c.setTipoComponente(dto.getTipoComponente());
                                c.setPuntajeObtenido(dto.getPuntajeObtenido());
                                c.setPuntajeMaximo(dto.getPuntajeMaximo());
                                c.setEstado(dto.getEstado());
                                return c;
                            }).collect(Collectors.toList());

            boolean hayCompletados = componentes.stream().anyMatch(c -> "COMPLETADO".equals(c.getEstado()));
            if (hayCompletados) {
                int totalObtenido = componentes.stream()
                        .mapToInt(c -> c.getPuntajeObtenido() != null ? c.getPuntajeObtenido() : 0)
                        .sum();
                int totalMaximo = componentes.stream()
                        .mapToInt(c -> c.getPuntajeMaximo() != null ? c.getPuntajeMaximo() : 0)
                        .sum();
                if (totalMaximo > 0) {
                    double promedioVigesimal = (totalObtenido * 20.0) / totalMaximo;
                    return BigDecimal.valueOf(promedioVigesimal)
                            .setScale(2, RoundingMode.HALF_UP);
                }
            }
        } catch (Exception e) {
            log.debug("No se pudieron consultar componentes de evaluación para expediente {}: {}", idExpediente, e.getMessage());
        }

        List<Evaluacion> evaluaciones = evaluacionRepository.findByExpedienteIdAndActivoTrue(idExpediente);

        if (evaluaciones.isEmpty()) {
            return BigDecimal.ZERO;
        }

        int totalObtenido = 0;
        int totalMaximo = 0;

        for (Evaluacion ev : evaluaciones) {
            List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(ev.getId());
            for (DetalleEvaluacion d : detalles) {
                totalObtenido += d.getPuntajeObtenido();
                totalMaximo += d.getCriterio().getPuntajeMaximo();
            }
        }

        if (totalMaximo == 0) {
            return BigDecimal.ZERO;
        }

        double promedioVigesimal = (totalObtenido * 20.0) / totalMaximo;
        return BigDecimal.valueOf(promedioVigesimal)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String determinarTipoCalificacion(Expediente expediente, EvaluacionRequestDTO request) {
        if (request.getTipoCalificacion() != null
                && (request.getTipoCalificacion().equals("VIGESIMAL") || request.getTipoCalificacion().equals("CUALITATIVA"))) {
            return request.getTipoCalificacion();
        }
        return expediente.getTipoPractica() != null && expediente.getTipoPractica().getTipoCalificacion() != null
                ? expediente.getTipoPractica().getTipoCalificacion()
                : "VIGESIMAL";
    }

    private String calcularCalificacionCualitativa(double promedio, String tipoCalificacion) {
        double porcentaje = (promedio / 20.0) * 100;

        if ("CUALITATIVA".equals(tipoCalificacion)) {
            if (porcentaje < 40) return "No logrado";
            if (porcentaje < 70) return "En proceso";
            return "Logrado";
        }

        if (porcentaje < 40) return CALIFICACIONES_CUALITATIVAS[0];
        if (porcentaje < 60) return CALIFICACIONES_CUALITATIVAS[1];
        if (porcentaje < 75) return CALIFICACIONES_CUALITATIVAS[2];
        if (porcentaje < 90) return CALIFICACIONES_CUALITATIVAS[3];
        return CALIFICACIONES_CUALITATIVAS[4];
    }

    private EvaluacionResponseDTO toResponse(Evaluacion evaluacion, List<DetalleEvaluacion> detalles, BigDecimal promedio, String calificacionCualitativa) {
        return EvaluacionResponseDTO.builder()
                .id(evaluacion.getId())
                .idExpediente(evaluacion.getExpediente().getId())
                .nombreEstudiante(evaluacion.getExpediente().getEstudiante().getUsuario().getNombres()
                        + " " + evaluacion.getExpediente().getEstudiante().getUsuario().getApellidoPaterno())
                .tipoEvaluador(evaluacion.getTipoEvaluador())
                .evaluadorId(evaluacion.getEvaluadorId())
                .componente(evaluacion.getComponente())
                .puntajeTotal(evaluacion.getPuntajeTotal())
                .promedioFinal(promedio)
                .calificacionCualitativa(evaluacion.getCalificacionCualitativa() != null ? evaluacion.getCalificacionCualitativa() : calificacionCualitativa)
                .comentarios(evaluacion.getComentarios())
                .fechaEvaluacion(evaluacion.getFechaEvaluacion())
                .detalles(detalles.stream()
                        .map(this::toDetalleDTO)
                        .collect(Collectors.toList()))
                .horasRegistradas(evaluacion.getHorasRegistradas())
                .rutaConstancia(evaluacion.getRutaConstancia())
                .tipoCalificacion(evaluacion.getTipoCalificacion())
                .activo(evaluacion.getActivo())
                .build();
    }

    private DetalleEvaluacionDTO toDetalleDTO(DetalleEvaluacion detalle) {
        return DetalleEvaluacionDTO.builder()
                .id(detalle.getId())
                .idCriterio(detalle.getCriterio().getId())
                .nombreCriterio(detalle.getCriterio().getNombre())
                .puntajeMaximo(detalle.getCriterio().getPuntajeMaximo())
                .puntajeObtenido(detalle.getPuntajeObtenido())
                .calificacionCualitativa(detalle.getCalificacionCualitativa())
                .comentarios(detalle.getComentarios())
                .build();
    }

    private CriterioEvaluacionDTO toCriterioDTO(CriterioEvaluacion criterio) {
        return CriterioEvaluacionDTO.builder()
                .id(criterio.getId())
                .codigo(criterio.getCodigo())
                .nombre(criterio.getNombre())
                .descripcion(criterio.getDescripcion())
                .puntajeMaximo(criterio.getPuntajeMaximo())
                .componente(criterio.getComponente())
                .build();
    }
}
