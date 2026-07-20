package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.NotaUnidadRequestDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.NotaUnidadResponseDTO;

import java.util.List;

public interface NotaUnidadService {

    NotaUnidadResponseDTO registrar(Long idExpediente, NotaUnidadRequestDTO request, Long idEvaluador);

    List<NotaUnidadResponseDTO> listarPorExpediente(Long idExpediente);

    NotaUnidadResponseDTO obtenerPorExpedienteYUnidad(Long idExpediente, Integer numeroUnidad);
}
