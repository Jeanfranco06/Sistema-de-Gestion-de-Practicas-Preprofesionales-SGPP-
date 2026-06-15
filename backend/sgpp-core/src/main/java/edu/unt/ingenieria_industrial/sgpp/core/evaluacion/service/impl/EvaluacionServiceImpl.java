package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.EvaluacionService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.Practica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.PracticaRepository;
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
    private final PracticaRepository practicaRepository;

    // Reglas de peso por unidad
    private static final Map<String, Double> PESOS_UNIDAD = Map.of(
            "U1", 0.30,  // U1: 30%
            "U2", 0.30,  // U2: 30%
            "U3", 0.40   // U3: 40%
    );

    // Mapeo de puntaje a calificación cualitativa
    private static final String[] CALIFICACIONES_CUALITATIVAS = {"Deficiente", "Regular", "Bueno", "Muy Bueno", "Excelente"};

    @Override
    public EvaluacionResponseDTO crearEvaluacion(EvaluacionRequestDTO request, Long idUsuario) {
        Practica practica = practicaRepository.findById(request.getIdPractica())
                .orElseThrow(() -> new ResourceNotFoundException("Práctica", "id", request.getIdPractica()));

        // Calcular puntaje total
        int puntajeTotal = request.getDetalles().stream()
                .mapToInt(DetalleEvaluacionRequestDTO::getPuntajeObtenido)
                .sum();

        // Determinar tipo de calificación
        String tipoPractica = practica.getTipoPractica() != null ? practica.getTipoPractica().getCodigo() : "FINAL";
        String tipoCalificacion = "INICIAL".equals(tipoPractica) ? "CUALITATIVA" : "VIGESIMAL";

        // Crear evaluación
        Evaluacion evaluacionToSave = Evaluacion.builder()
                .practica(practica)
                .tipoEvaluador(request.getTipoEvaluador())
                .evaluadorId(request.getEvaluadorId())
                .unidad(request.getUnidad())
                .puntajeTotal(puntajeTotal)
                .comentarios(request.getComentarios())
                .fechaEvaluacion(request.getFechaEvaluacion() != null ? request.getFechaEvaluacion() : LocalDate.now())
                .horasRegistradas(request.getHorasRegistradas() != null ? request.getHorasRegistradas() : 0)
                .rutaConstancia(request.getRutaConstancia())
                .tipoCalificacion(request.getTipoCalificacion() != null ? request.getTipoCalificacion() : tipoCalificacion)
                .activo(true)
                .build();

        final Evaluacion evaluacion = evaluacionRepository.save(evaluacionToSave);

        // Crear detalles de evaluación
        List<DetalleEvaluacion> detalles = request.getDetalles().stream()
                .map(dto -> {
                    CriterioEvaluacion criterio = criterioEvaluacionRepository.findById(dto.getIdCriterio())
                            .orElseThrow(() -> new ResourceNotFoundException("Criterio de Evaluación", "id", dto.getIdCriterio()));

                    return DetalleEvaluacion.builder()
                            .evaluacion(evaluacion)
                            .criterio(criterio)
                            .puntajeObtenido(dto.getPuntajeObtenido())
                            .comentarios(dto.getComentarios())
                            .build();
                })
                .collect(Collectors.toList());

        detalleEvaluacionRepository.saveAll(detalles);

        // Calcular promedio final
        BigDecimal promedio = calcularPromedioFinal(practica.getId());
        String calificacionCualitativa = calcularCalificacionCualitativa(puntajeTotal, detalles);

        return toResponse(evaluacion, detalles, promedio, calificacionCualitativa);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluacionResponseDTO obtenerEvaluacionPorId(Long id) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluación", "id", id));

        List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(id);
        BigDecimal promedio = calcularPromedioFinal(evaluacion.getPractica().getId());
        String calificacionCualitativa = calcularCalificacionCualitativa(evaluacion.getPuntajeTotal(), detalles);

        return toResponse(evaluacion, detalles, promedio, calificacionCualitativa);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluacionResponseDTO> obtenerEvaluacionesPorPractica(Long idPractica) {
        List<Evaluacion> evaluaciones = evaluacionRepository.findByPracticaIdAndActivoTrue(idPractica);
        BigDecimal promedio = calcularPromedioFinal(idPractica);

        return evaluaciones.stream()
                .map(ev -> {
                    List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(ev.getId());
                    String calificacionCualitativa = calcularCalificacionCualitativa(ev.getPuntajeTotal(), detalles);
                    return toResponse(ev, detalles, promedio, calificacionCualitativa);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CriterioEvaluacionDTO> obtenerCriteriosPorTipoEvaluador(String tipoEvaluador) {
        List<CriterioEvaluacion> criterios = criterioEvaluacionRepository.findByTipoEvaluadorAndActivoTrue(tipoEvaluador);
        log.info("Consultando criterios para tipo: {}, encontrados: {}", tipoEvaluador, criterios.size());
        return criterios
                .stream()
                .map(this::toCriterioDTO)
                .collect(Collectors.toList());
    }

    private BigDecimal calcularPromedioFinal(Long idPractica) {
        List<Evaluacion> evaluaciones = evaluacionRepository.findByPracticaIdAndActivoTrue(idPractica);

        if (evaluaciones.isEmpty()) {
            return BigDecimal.ZERO;
        }

        double promedioPonderado = 0;

        for (Evaluacion ev : evaluaciones) {
            List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(ev.getId());
            int totalPuntos = ev.getPuntajeTotal();
            int maxPuntos = detalles.stream().mapToInt(d -> d.getCriterio().getPuntajeMaximo()).sum();

            double porcentaje = 0;

            if ("U1".equals(ev.getUnidad()) && "DOCENTE".equals(ev.getTipoEvaluador())) {
                int planObtenido = 0;
                int planMaximo = 0;
                int informeObtenido = 0;
                int informeMaximo = 0;

                for (DetalleEvaluacion d : detalles) {
                    if ("DA-PLAN".equals(d.getCriterio().getCodigo())) {
                        planObtenido += d.getPuntajeObtenido();
                        planMaximo += d.getCriterio().getPuntajeMaximo();
                    } else {
                        informeObtenido += d.getPuntajeObtenido();
                        informeMaximo += d.getCriterio().getPuntajeMaximo();
                    }
                }

                double porcentajePlan = planMaximo > 0 ? ((double) planObtenido / planMaximo * 100) : 0.0;
                double porcentajeInforme = informeMaximo > 0 ? ((double) informeObtenido / informeMaximo * 100) : 0.0;

                // Si no se evaluó el plan, todo recae en el informe y viceversa (fallback)
                if (planMaximo == 0) {
                    porcentaje = porcentajeInforme;
                } else if (informeMaximo == 0) {
                    porcentaje = porcentajePlan;
                } else {
                    porcentaje = (porcentajePlan * 0.20) + (porcentajeInforme * 0.80);
                }
            } else {
                porcentaje = (double) totalPuntos / maxPuntos * 100;
            }

            double peso = PESOS_UNIDAD.getOrDefault(ev.getUnidad(), 0.3); // U1 y U2: 30%, U3: 40%
            promedioPonderado += porcentaje * peso;
        }

        // Convertir a escala vigesimal (0-20)
        return BigDecimal.valueOf(promedioPonderado)
                .divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
    }

    private String calcularCalificacionCualitativa(int puntajeTotal, List<DetalleEvaluacion> detalles) {
        if (detalles.isEmpty()) return CALIFICACIONES_CUALITATIVAS[1];

        int maxPuntos = detalles.stream().mapToInt(d -> d.getCriterio().getPuntajeMaximo()).sum();
        if (maxPuntos == 0) return CALIFICACIONES_CUALITATIVAS[1];

        double porcentaje = (double) puntajeTotal / maxPuntos * 100;

        if (porcentaje < 40) return CALIFICACIONES_CUALITATIVAS[0];
        if (porcentaje < 60) return CALIFICACIONES_CUALITATIVAS[1];
        if (porcentaje < 75) return CALIFICACIONES_CUALITATIVAS[2];
        if (porcentaje < 90) return CALIFICACIONES_CUALITATIVAS[3];
        return CALIFICACIONES_CUALITATIVAS[4];
    }

    private EvaluacionResponseDTO toResponse(Evaluacion evaluacion, List<DetalleEvaluacion> detalles, BigDecimal promedio, String calificacionCualitativa) {
        return EvaluacionResponseDTO.builder()
                .id(evaluacion.getId())
                .idPractica(evaluacion.getPractica().getId())
                .nombreEstudiante(evaluacion.getPractica().getEstudiante().getUsuario().getNombres()
                        + " " + evaluacion.getPractica().getEstudiante().getUsuario().getApellidoPaterno())
                .tipoEvaluador(evaluacion.getTipoEvaluador())
                .evaluadorId(evaluacion.getEvaluadorId())
                .unidad(evaluacion.getUnidad())
                .puntajeTotal(evaluacion.getPuntajeTotal())
                .promedioFinal(promedio)
                .calificacionCualitativa(calificacionCualitativa)
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
                .tipoEvaluador(criterio.getTipoEvaluador())
                .build();
    }
}

