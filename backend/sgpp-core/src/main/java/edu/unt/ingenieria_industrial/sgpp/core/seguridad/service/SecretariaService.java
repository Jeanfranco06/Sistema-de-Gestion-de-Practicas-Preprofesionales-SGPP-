package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ValidacionRequisitosDTO;

import java.util.List;

public interface SecretariaService {
    List<EstudianteDTO> findAllEstudiantes();
    ValidacionRequisitosDTO validarRequisitos(Long estudianteId);
    EstudianteDTO updateDatosAcademicos(Long estudianteId, EstudianteDTO dto);
    void emitirCartaPresentacion(Long expedienteId, Long idUsuario);
    void emitirConstancia(Long expedienteId, Long idUsuario);
    void registrarIncidencia(Long expedienteId, String incidencia, Long idUsuario);
}

