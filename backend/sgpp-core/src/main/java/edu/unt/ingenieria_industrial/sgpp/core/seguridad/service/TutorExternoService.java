package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.TutorExternoDTO;

import java.util.List;

public interface TutorExternoService {
    TutorExternoDTO create(TutorExternoDTO dto);
    TutorExternoDTO update(Long id, TutorExternoDTO dto);
    TutorExternoDTO findById(Long id);
    List<TutorExternoDTO> findAll();
    void disable(Long id);
    List<TutorExternoDTO> findByEmpresaId(Long empresaId);
    List<TutorExternoDTO> findBySedeId(Long sedeId);
    List<TutorExternoDTO> findByEmpresaIdAndEstadoTutor(Long empresaId, String estadoTutor);
    List<TutorExternoDTO> findBySedeIdAndEstadoTutor(Long sedeId, String estadoTutor);
    List<TutorExternoDTO> findActiveByEmpresaId(Long empresaId);
    List<TutorExternoDTO> findActiveBySedeId(Long sedeId);
    List<TutorExternoDTO> findActiveByEmpresaOrSedeId(Long id);
    void cambiarEstado(Long id, String estadoTutor);
}

