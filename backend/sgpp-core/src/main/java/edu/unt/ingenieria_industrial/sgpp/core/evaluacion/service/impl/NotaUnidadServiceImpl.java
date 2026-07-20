package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.NotaUnidadRequestDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.NotaUnidadResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.NotaUnidad;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.NotaUnidadRepository;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.NotaUnidadService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotaUnidadServiceImpl implements NotaUnidadService {

    private static final BigDecimal NOTA_MINIMA_APROBATORIA = new BigDecimal("13.50");
    private static final int ESCALA_MAXIMA = 20;

    private final NotaUnidadRepository notaUnidadRepository;
    private final ExpedienteRepository expedienteRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public NotaUnidadResponseDTO registrar(Long idExpediente, NotaUnidadRequestDTO request, Long idEvaluador) {
        if (request.getNumeroUnidad() == null || request.getNumeroUnidad() < 1 || request.getNumeroUnidad() > 3) {
            throw new BusinessException("El número de unidad debe estar entre 1 y 3");
        }

        Expediente expediente = expedienteRepository.findById(idExpediente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente", "id", idExpediente));

        if (!"INICIAL".equalsIgnoreCase(expediente.getTipoPractica().getCodigo())) {
            throw new BusinessException("Las notas por unidades solo aplican a prácticas iniciales");
        }

        Usuario evaluador = usuarioRepository.findById(idEvaluador)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idEvaluador));

        BigDecimal notaFinalUnidad;
        Integer porcentajePlan;
        Integer porcentajeInforme;

        if (request.getNumeroUnidad() == 1) {
            if (request.getNotaPlan() == null) {
                throw new BusinessException("La unidad 1 requiere la nota del plan");
            }
            porcentajePlan = 20;
            porcentajeInforme = 80;
            notaFinalUnidad = request.getNotaPlan()
                    .multiply(BigDecimal.valueOf(porcentajePlan))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    .add(request.getNotaInforme()
                            .multiply(BigDecimal.valueOf(porcentajeInforme))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        } else {
            porcentajePlan = 0;
            porcentajeInforme = 100;
            notaFinalUnidad = request.getNotaInforme();
        }

        NotaUnidad nota = notaUnidadRepository
                .findByExpedienteIdAndNumeroUnidadAndActivoTrue(idExpediente, request.getNumeroUnidad())
                .map(existente -> {
                    existente.setNotaPlan(request.getNotaPlan());
                    existente.setNotaInforme(request.getNotaInforme());
                    existente.setNotaFinalUnidad(notaFinalUnidad);
                    existente.setPorcentajePlan(porcentajePlan);
                    existente.setPorcentajeInforme(porcentajeInforme);
                    existente.setComentarios(request.getComentarios());
                    existente.setFechaEvaluacion(LocalDate.now());
                    existente.setEvaluador(evaluador);
                    return existente;
                })
                .orElseGet(() -> NotaUnidad.builder()
                        .expediente(expediente)
                        .numeroUnidad(request.getNumeroUnidad())
                        .notaPlan(request.getNotaPlan())
                        .notaInforme(request.getNotaInforme())
                        .notaFinalUnidad(notaFinalUnidad)
                        .porcentajePlan(porcentajePlan)
                        .porcentajeInforme(porcentajeInforme)
                        .comentarios(request.getComentarios())
                        .fechaEvaluacion(LocalDate.now())
                        .evaluador(evaluador)
                        .activo(true)
                        .build());

        nota = notaUnidadRepository.save(nota);
        log.info("Nota unidad {} registrada para expediente {}: {}",
                request.getNumeroUnidad(), idExpediente, notaFinalUnidad);

        sincronizarCalificacionFinal(expediente);

        return toResponse(nota);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotaUnidadResponseDTO> listarPorExpediente(Long idExpediente) {
        return notaUnidadRepository.findByExpedienteIdAndActivoTrueOrderByNumeroUnidadAsc(idExpediente).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotaUnidadResponseDTO obtenerPorExpedienteYUnidad(Long idExpediente, Integer numeroUnidad) {
        NotaUnidad nota = notaUnidadRepository.findByExpedienteIdAndNumeroUnidadAndActivoTrue(idExpediente, numeroUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Nota de unidad no encontrada"));
        return toResponse(nota);
    }

    private void sincronizarCalificacionFinal(Expediente expediente) {
        List<NotaUnidad> notas = notaUnidadRepository
                .findByExpedienteIdAndActivoTrueOrderByNumeroUnidadAsc(expediente.getId());
        if (notas.size() < 3) {
            return;
        }

        BigDecimal promedio = notas.stream()
                .map(NotaUnidad::getNotaFinalUnidad)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);

        expediente.setCalificacionFinal(promedio);
        expedienteRepository.save(expediente);
        log.info("Calificación final sincronizada desde notas por unidad: expediente={}, promedio={}",
                expediente.getId(), promedio);
    }

    private NotaUnidadResponseDTO toResponse(NotaUnidad nota) {
        List<NotaUnidad> notas = notaUnidadRepository
                .findByExpedienteIdAndActivoTrueOrderByNumeroUnidadAsc(nota.getExpediente().getId());
        BigDecimal promedio = notas.size() >= 3
                ? notas.stream().map(NotaUnidad::getNotaFinalUnidad).reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP)
                : null;

        return NotaUnidadResponseDTO.builder()
                .id(nota.getId())
                .idExpediente(nota.getExpediente().getId())
                .numeroUnidad(nota.getNumeroUnidad())
                .notaPlan(nota.getNotaPlan())
                .notaInforme(nota.getNotaInforme())
                .notaFinalUnidad(nota.getNotaFinalUnidad())
                .porcentajePlan(nota.getPorcentajePlan())
                .porcentajeInforme(nota.getPorcentajeInforme())
                .comentarios(nota.getComentarios())
                .fechaEvaluacion(nota.getFechaEvaluacion())
                .idEvaluador(nota.getEvaluador().getId())
                .nombreEvaluador(nota.getEvaluador().getNombres() + " " + nota.getEvaluador().getApellidoPaterno())
                .promedioFinal(promedio)
                .aprobado(promedio != null && promedio.compareTo(NOTA_MINIMA_APROBATORIA) >= 0)
                .build();
    }
}
