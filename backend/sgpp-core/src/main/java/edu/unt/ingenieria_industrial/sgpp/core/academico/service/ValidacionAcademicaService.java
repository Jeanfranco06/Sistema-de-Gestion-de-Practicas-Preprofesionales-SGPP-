package edu.unt.ingenieria_industrial.sgpp.core.academico.service;

import edu.unt.ingenieria_industrial.sgpp.core.academico.dto.*;

import java.util.List;

public interface ValidacionAcademicaService {

    ValidacionAcademicaResponse validarEstudiante(ValidacionAcademicaRequest request);

    ValidacionAcademicaResponse obtenerResultadoPorId(Long id);

    List<ValidacionAcademicaResponse> listarResultadosPorEstudiante(Long estudianteId);

    ValidacionAcademicaResponse obtenerUltimoResultado(Long estudianteId, String codigoTipoPractica);

    List<ReglaValidacionDTO> listarReglasPorTipoPractica(String codigoTipoPractica);

    List<NormaValidacionDTO> listarNormasActivas();
}
