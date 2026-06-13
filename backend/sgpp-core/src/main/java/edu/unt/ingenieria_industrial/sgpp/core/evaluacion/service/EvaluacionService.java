package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionRequestDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.CriterioEvaluacionDTO;

import java.util.List;

public interface EvaluacionService {
    EvaluacionResponseDTO crearEvaluacion(EvaluacionRequestDTO request, Long idUsuario);
    EvaluacionResponseDTO obtenerEvaluacionPorId(Long id);
    List<EvaluacionResponseDTO> obtenerEvaluacionesPorPractica(Long idPractica);
    List<CriterioEvaluacionDTO> obtenerCriteriosPorTipoEvaluador(String tipoEvaluador);
}

