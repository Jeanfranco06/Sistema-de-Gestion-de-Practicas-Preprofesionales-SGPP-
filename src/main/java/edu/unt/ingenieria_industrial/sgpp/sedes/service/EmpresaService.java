package edu.unt.ingenieria_industrial.sgpp.sedes.service;

import edu.unt.ingenieria_industrial.sgpp.sedes.dto.EmpresaDTO;
import java.util.List;

public interface EmpresaService {
    EmpresaDTO create(EmpresaDTO dto);
    EmpresaDTO update(Long id, EmpresaDTO dto);
    EmpresaDTO findById(Long id);
    List<EmpresaDTO> findAll();
    void disable(Long id);
    void validate(Long id);
}
