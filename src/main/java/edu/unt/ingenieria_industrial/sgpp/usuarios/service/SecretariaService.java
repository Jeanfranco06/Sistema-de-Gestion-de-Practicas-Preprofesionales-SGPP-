package edu.unt.ingenieria_industrial.sgpp.usuarios.service;

import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.ValidacionRequisitosDTO;

import java.util.List;

public interface SecretariaService {
    List<EstudianteDTO> findAllEstudiantes();
    ValidacionRequisitosDTO validarRequisitos(Long estudianteId);
    EstudianteDTO updateDatosAcademicos(Long estudianteId, EstudianteDTO dto);
}
