package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.ValidacionSedeDTO;

import java.time.LocalDate;
import java.util.List;

public interface ValidacionSedeService {
    ValidacionSedeDTO create(ValidacionSedeDTO dto);
    ValidacionSedeDTO update(Long id, ValidacionSedeDTO dto);
    ValidacionSedeDTO findById(Long id);
    List<ValidacionSedeDTO> findBySedeId(Long sedeId);
    List<ValidacionSedeDTO> findHistorialBySedeId(Long sedeId);
    ValidacionSedeDTO findValidacionVigente(Long sedeId);
    void delete(Long id);
}
