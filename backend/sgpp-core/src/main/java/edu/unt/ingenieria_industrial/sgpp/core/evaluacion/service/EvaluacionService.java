package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionRequestDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.CriterioEvaluacionDTO;

import java.util.Collection;
import java.util.List;

public interface EvaluacionService {
    EvaluacionResponseDTO crearEvaluacion(EvaluacionRequestDTO request, Long idUsuario, Collection<String> roles);
    EvaluacionResponseDTO obtenerEvaluacionPorId(Long id);
    EvaluacionResponseDTO actualizarEvaluacion(Long idEvaluacion, EvaluacionRequestDTO request);
    List<EvaluacionResponseDTO> obtenerEvaluacionesPorPractica(Long idPractica);
    List<CriterioEvaluacionDTO> obtenerCriteriosPorTipoEvaluador(String tipoEvaluador);
}

