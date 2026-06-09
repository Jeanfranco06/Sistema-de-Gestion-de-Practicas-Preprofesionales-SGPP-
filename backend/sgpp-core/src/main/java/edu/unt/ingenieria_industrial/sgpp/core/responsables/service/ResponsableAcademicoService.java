package edu.unt.ingenieria_industrial.sgpp.core.responsables.service;

import edu.unt.ingenieria_industrial.sgpp.core.responsables.dto.*;

import java.util.List;

public interface ResponsableAcademicoService {

    AsignacionAsesorResponse asignarAsesor(AsignacionAsesorRequest request);

    AsignacionAsesorResponse reasignarAsesor(ReasignarAsesorRequest request);

    void finalizarAsignacionAsesor(Long idAsignacion);

    AsignacionAsesorResponse findAsignacionById(Long id);

    AsignacionAsesorResponse findAsignacionActivaByEstudiante(Long idEstudiante);

    List<AsignacionAsesorResponse> listarAsignacionesPorDocente(Long idDocente);

    DesignacionCoordinadorResponse designarCoordinador(DesignacionCoordinadorRequest request);

    void finalizarDesignacionCoordinador(Long idDesignacion);

    DesignacionCoordinadorResponse findDesignacionById(Long id);

    DesignacionCoordinadorResponse findCoordinadorVigente();

    DesignacionCoordinadorResponse findCoordinadorByPeriodo(String periodo);

    List<DesignacionCoordinadorResponse> listarDesignacionesPorPeriodo(String periodo);

    ResponsableVigenteDTO obtenerResponsablesVigentes();
}
