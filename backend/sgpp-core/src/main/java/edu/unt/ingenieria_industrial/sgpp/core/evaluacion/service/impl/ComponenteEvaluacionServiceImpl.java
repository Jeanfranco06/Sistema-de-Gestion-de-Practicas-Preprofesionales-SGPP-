package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.ComponenteEvaluacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.ComponenteEvaluacion;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.ComponenteEvaluacionRepository;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.ComponenteEvaluacionService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComponenteEvaluacionServiceImpl implements ComponenteEvaluacionService {

    private final ComponenteEvaluacionRepository componenteRepository;
    private final ExpedienteRepository expedienteRepository;

    @Override
    @Transactional
    public void inicializarComponentes(Long expedienteId, String tipoPractica) {
        Expediente expediente = expedienteRepository.findById(expedienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente", "id", expedienteId));

        // Verificar que no existan componentes ya inicializados
        List<ComponenteEvaluacion> existentes = componenteRepository.findByExpedienteIdAndActivoTrue(expedienteId);
        if (!existentes.isEmpty()) {
            log.info("Componentes de evaluación ya inicializados para expediente {}", expedienteId);
            return;
        }

        // Según normativa UNT 2025:
        // - PLAN: 10 puntos (10%) - Docente Asesor
        // - EMPRESA: 50 puntos (50%) - Tutor Externo
        // - INFORME: 40 puntos (40%) - Comité

        ComponenteEvaluacion plan = ComponenteEvaluacion.builder()
                .expediente(expediente)
                .tipoComponente("PLAN")
                .puntajeMaximo(10)
                .porcentaje(10)
                .estado("PENDIENTE")
                .activo(true)
                .build();

        ComponenteEvaluacion empresa = ComponenteEvaluacion.builder()
                .expediente(expediente)
                .tipoComponente("EMPRESA")
                .puntajeMaximo(50)
                .porcentaje(50)
                .estado("PENDIENTE")
                .activo(true)
                .build();

        ComponenteEvaluacion informe = ComponenteEvaluacion.builder()
                .expediente(expediente)
                .tipoComponente("INFORME")
                .puntajeMaximo(40)
                .porcentaje(40)
                .estado("PENDIENTE")
                .activo(true)
                .build();

        componenteRepository.saveAll(List.of(plan, empresa, informe));
        log.info("Componentes de evaluación inicializados para expediente {} (tipo: {})", 
                expedienteId, tipoPractica);
    }

    @Override
    @Transactional
    public ComponenteEvaluacionDTO registrarEvaluacion(Long expedienteId, String tipoComponente,
            Integer puntaje, Long evaluadorId, String tipoEvaluador, String observaciones) {
        ComponenteEvaluacion componente = componenteRepository
                .findByExpedienteIdAndTipoComponenteAndActivoTrue(expedienteId, tipoComponente)
                .orElseThrow(() -> new ResourceNotFoundException("Componente de evaluación no encontrado"));

        if (puntaje < 0 || puntaje > componente.getPuntajeMaximo()) {
            throw new BusinessException(
                    "Puntaje inválido. Debe estar entre 0 y " + componente.getPuntajeMaximo());
        }

        componente.setPuntajeObtenido(puntaje);
        componente.setEvaluadorId(evaluadorId);
        componente.setTipoEvaluador(tipoEvaluador);
        componente.setFechaEvaluacion(LocalDate.now());
        componente.setObservaciones(observaciones);
        componente.setEstado("COMPLETADO");

        componente = componenteRepository.save(componente);
        log.info("Evaluación registrada: expediente={}, componente={}, puntaje={}", 
                expedienteId, tipoComponente, puntaje);

        return toDto(componente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComponenteEvaluacionDTO> obtenerComponentesPorExpediente(Long expedienteId) {
        return componenteRepository.findByExpedienteIdAndActivoTrue(expedienteId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Integer calcularPuntajeTotal(Long expedienteId) {
        List<ComponenteEvaluacion> componentes = componenteRepository.findByExpedienteIdAndActivoTrue(expedienteId);
        
        return componentes.stream()
                .filter(c -> "COMPLETADO".equals(c.getEstado()))
                .mapToInt(c -> c.getPuntajeObtenido() != null ? c.getPuntajeObtenido() : 0)
                .sum();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean estanTodosComponentesCompletados(Long expedienteId) {
        List<ComponenteEvaluacion> componentes = componenteRepository.findByExpedienteIdAndActivoTrue(expedienteId);
        
        return componentes.stream()
                .allMatch(c -> "COMPLETADO".equals(c.getEstado()));
    }

    private ComponenteEvaluacionDTO toDto(ComponenteEvaluacion entity) {
        return ComponenteEvaluacionDTO.builder()
                .id(entity.getId())
                .idExpediente(entity.getExpediente().getId())
                .tipoComponente(entity.getTipoComponente())
                .puntajeMaximo(entity.getPuntajeMaximo())
                .puntajeObtenido(entity.getPuntajeObtenido())
                .porcentaje(entity.getPorcentaje())
                .evaluadorId(entity.getEvaluadorId())
                .tipoEvaluador(entity.getTipoEvaluador())
                .fechaEvaluacion(entity.getFechaEvaluacion())
                .observaciones(entity.getObservaciones())
                .estado(entity.getEstado())
                .activo(entity.getActivo())
                .build();
    }
}
