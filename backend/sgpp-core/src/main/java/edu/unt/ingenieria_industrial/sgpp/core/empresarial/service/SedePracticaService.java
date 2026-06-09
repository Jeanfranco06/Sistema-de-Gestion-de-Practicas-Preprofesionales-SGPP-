package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedeCatalogoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedePracticaDTO;
import java.util.List;

public interface SedePracticaService {
    SedePracticaDTO create(SedePracticaDTO dto);
    SedePracticaDTO update(Long id, SedePracticaDTO dto);
    SedePracticaDTO findById(Long id);
    List<SedePracticaDTO> findAllActive();
    List<SedePracticaDTO> findByEmpresaId(Long empresaId);
    List<SedePracticaDTO> findWithValidConvenios();
    List<SedePracticaDTO> findByEstadoSede(String estadoSede);
    List<SedePracticaDTO> findByEmpresaIdAndEstadoSede(Long empresaId, String estadoSede);
    List<SedePracticaDTO> findByDistrito(String distrito);
    List<SedePracticaDTO> findByProvincia(String provincia);
    List<SedePracticaDTO> findByDepartamento(String departamento);
    List<SedePracticaDTO> findByCapacidadMinima(Integer capacidadMinima);
    List<SedePracticaDTO> findAvailableForStudents();
    void disable(Long id);
    void cambiarEstado(Long id, String estado);
    List<SedeCatalogoDTO> getCatalogoSedes();
    SedeCatalogoDTO getDetalleSede(Long id);
}

