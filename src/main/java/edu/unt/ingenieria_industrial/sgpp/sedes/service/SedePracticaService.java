package edu.unt.ingenieria_industrial.sgpp.sedes.service;

import edu.unt.ingenieria_industrial.sgpp.sedes.dto.SedePracticaDTO;
import java.util.List;

public interface SedePracticaService {
    SedePracticaDTO create(SedePracticaDTO dto);
    SedePracticaDTO update(Long id, SedePracticaDTO dto);
    SedePracticaDTO findById(Long id);
    List<SedePracticaDTO> findAllActive();
    List<SedePracticaDTO> findByEmpresaId(Long empresaId);
    void disable(Long id);
}
