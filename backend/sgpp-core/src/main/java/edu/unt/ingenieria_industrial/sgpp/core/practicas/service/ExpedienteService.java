package edu.unt.ingenieria_industrial.sgpp.core.practicas.service;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.ExpedienteDTO;

import java.util.List;

public interface ExpedienteService {
    ExpedienteDTO create(ExpedienteDTO dto);
    ExpedienteDTO update(Long id, ExpedienteDTO dto);
    ExpedienteDTO findById(Long id);
    List<ExpedienteDTO> findAll();
    List<ExpedienteDTO> findByEstudianteId(Long estudianteId);
    List<ExpedienteDTO> findByTutorEmpresaId(Long tutorEmpresaId);
    void disable(Long id);
}
