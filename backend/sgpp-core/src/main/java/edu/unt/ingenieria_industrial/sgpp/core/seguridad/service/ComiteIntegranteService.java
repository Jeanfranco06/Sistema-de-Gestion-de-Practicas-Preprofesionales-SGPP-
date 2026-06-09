package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ComiteIntegranteRequest;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ComiteIntegranteResponse;

import java.util.List;

public interface ComiteIntegranteService {
    ComiteIntegranteResponse create(ComiteIntegranteRequest request);
    ComiteIntegranteResponse update(Long id, ComiteIntegranteRequest request);
    ComiteIntegranteResponse findById(Long id);
    List<ComiteIntegranteResponse> findAll();
    List<ComiteIntegranteResponse> findAllActive();
    List<ComiteIntegranteResponse> findByPeriodo(String periodo);
    void updateEstado(Long id, String estado);
    ComiteIntegranteResponse findPresidente();
    void cerrarPeriodo(String periodo);
    List<ComiteIntegranteResponse> getVigente();
}
