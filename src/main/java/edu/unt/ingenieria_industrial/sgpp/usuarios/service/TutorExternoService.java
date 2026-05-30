package edu.unt.ingenieria_industrial.sgpp.usuarios.service;

import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.TutorExternoDTO;

import java.util.List;

public interface TutorExternoService {
    TutorExternoDTO create(TutorExternoDTO dto);
    TutorExternoDTO update(Long id, TutorExternoDTO dto);
    TutorExternoDTO findById(Long id);
    List<TutorExternoDTO> findAll();
    void disable(Long id);
}
