package edu.unt.ingenieria_industrial.sgpp.core.practicas.service;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.PracticaDTO;

import java.util.List;

public interface PracticaService {
    PracticaDTO create(PracticaDTO dto);
    PracticaDTO update(Long id, PracticaDTO dto);
    PracticaDTO findById(Long id);
    List<PracticaDTO> findByEstudianteId(Long estudianteId);
    List<PracticaDTO> findBySedeId(Long sedeId);
    List<PracticaDTO> findAll();
    void disable(Long id);
    PracticaDTO seleccionarSede(Long estudianteId, Long sedeId);

    PracticaDTO solicitarPractica(Long estudianteId, Long sedeId, Long tipoPracticaId);
}
