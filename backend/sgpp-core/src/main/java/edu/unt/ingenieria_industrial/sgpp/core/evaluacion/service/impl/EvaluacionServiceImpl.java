package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.EvaluacionService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
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

    private static final String[] CALIFICACIONES_CUALITATIVAS = {"Deficiente", "Regular", "Bueno", "Muy Bueno", "Excelente"};

    @Override
    public EvaluacionResponseDTO crearEvaluacion(EvaluacionRequestDTO request, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(request.getIdExpediente())
                .orElseThrow(() -> new ResourceNotFoundException("Expediente", "id", request.getIdExpediente()));

        // Calcular puntaje ponderado de la evaluacion
        // El puntaje ingresado por el usuario es sobre 20. El puntaje máximo del criterio es el peso (%)
        int puntajeTotal = request.getDetalles().stream()
                .mapToInt(DetalleEvaluacionRequestDTO::getPuntajeObtenido)
                .sum(); // Suma simple de notas para tracking o estadisticas

        // Determinar tipo de calificación
        String tipoPractica = expediente.getTipoPractica() != null ? expediente.getTipoPractica().getCodigo() : "FINAL";
        String tipoCalificacion = "INICIAL".equals(tipoPractica) ? "CUALITATIVA" : "VIGESIMAL";

        // Crear evaluación
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
        BigDecimal promedio = calcularPromedioFinal(expediente.getId());
        String calificacionCualitativa = calcularCalificacionCualitativa(promedio.doubleValue());

        return toResponse(evaluacion, detalles, promedio, calificacionCualitativa);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluacionResponseDTO obtenerEvaluacionPorId(Long id) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluación", "id", id));

        List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(id);
        BigDecimal promedio = calcularPromedioFinal(evaluacion.getExpediente().getId());
        String calificacionCualitativa = calcularCalificacionCualitativa(promedio.doubleValue());

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
                    String calificacionCualitativa = calcularCalificacionCualitativa(promedio.doubleValue());
                    return toResponse(ev, detalles, promedio, calificacionCualitativa);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CriterioEvaluacionDTO> obtenerCriteriosPorTipoEvaluador(String componente) {
        List<CriterioEvaluacion> criterios = criterioEvaluacionRepository.findByComponenteAndActivoTrue(componente);
        log.info("Consultando criterios para componente: {}, encontrados: {}", componente, criterios.size());
        return criterios
                .stream()
                .map(this::toCriterioDTO)
                .collect(Collectors.toList());
    }

    private BigDecimal calcularPromedioFinal(Long idExpediente) {
        List<Evaluacion> evaluaciones = evaluacionRepository.findByExpedienteIdAndActivoTrue(idExpediente);

        if (evaluaciones.isEmpty()) {
            return BigDecimal.ZERO;
        }

        double promedioPonderadoTotal = 0;

        for (Evaluacion ev : evaluaciones) {
            List<DetalleEvaluacion> detalles = detalleEvaluacionRepository.findByEvaluacionId(ev.getId());
            double puntajeComponente = 0;

            for (DetalleEvaluacion d : detalles) {
                // Formula: Nota final = Suma(Nota * Peso%).
                double nota = d.getPuntajeObtenido();
                double pesoPorcentaje = d.getCriterio().getPuntajeMaximo() / 100.0;
                puntajeComponente += nota * pesoPorcentaje;
            }
            promedioPonderadoTotal += puntajeComponente;
        }

        return BigDecimal.valueOf(promedioPonderadoTotal)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String calcularCalificacionCualitativa(double promedio) {
        double porcentaje = (promedio / 20.0) * 100;

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
                .componente(criterio.getComponente())
                .build();
    }
}
