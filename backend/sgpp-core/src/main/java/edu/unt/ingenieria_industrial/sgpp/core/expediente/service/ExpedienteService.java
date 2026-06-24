package edu.unt.ingenieria_industrial.sgpp.core.expediente.service;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.*;
import java.time.LocalDate;
import java.util.List;

public interface ExpedienteService {
    ExpedienteResponse crear(CrearExpedienteRequest request, Long idUsuario);
    ExpedienteResponse asignarEmpresaSede(Long idExpediente, AsignarEmpresaSedeRequest request, Long idUsuario);
    ExpedienteResponse asignarAsesor(Long idExpediente, AsignarAsesorRequest request, Long idUsuario);
    ExpedienteResponse asignarComite(Long idExpediente, AsignarComiteRequest request, Long idUsuario);
    ExpedienteResponse presentarPlan(Long idExpediente, PresentarPlanRequest request, Long idUsuario);
    ExpedienteResponse agregarDocumento(Long idExpediente, String tipoDocumento, String nombreDoc, String fileName, Long idUsuario);
    ExpedienteResponse evaluarDocumento(Long idExpediente, Long idDocumento, String estado, String observaciones, Long idUsuario);
    ExpedienteResponse agregarObservacion(Long idExpediente, AgregarObservacionRequest request, Long idUsuario);
    ExpedienteResponse subsanarObservaciones(Long idExpediente, SubsanarObservacionesRequest request, Long idUsuario);
    ExpedienteResponse aprobarPlan(Long idExpediente, Long idUsuario);
    ExpedienteResponse aprobarInformeFinal(Long idExpediente, Long idUsuario);
    ExpedienteResponse iniciarEjecucion(Long idExpediente, Long idUsuario, LocalDate fechaInicio, Integer duracionSemanas);
    ExpedienteResponse presentarInformeParcial(Long idExpediente, Long idUsuario);
    ExpedienteResponse presentarInformeFinal(Long idExpediente, Long idUsuario);
    ExpedienteResponse evaluar(Long idExpediente, EvaluarExpedienteRequest request, Long idUsuario);
    ExpedienteResponse cerrar(Long idExpediente, Long idUsuario, String observacion);
    ExpedienteResponse cambiarEstado(Long idExpediente, CambioEstadoRequest request, Long idUsuario);
    ExpedienteResponse findById(Long id);
    List<ExpedienteResponse> findAll();
    List<ExpedienteResponse> findByEstudianteId(Long estudianteId);
    List<ExpedienteResponse> findByEstado(String estado);
    List<ExpedienteResponse> findByTutorEmpresaId(Long tutorId);
    List<ExpedienteResponse> findByTutorUsuarioId(Long usuarioId);
    List<ExpedienteResponse> findByAsesorId(Long asesorId);
    List<ExpedienteResponse> findMisExpedientes(Long idUsuario, java.util.Collection<String> roles);
    ExpedienteResponse findByIdForUser(Long id, Long idUsuario, java.util.Collection<String> roles);
    List<ExpedienteResponse> findByEstudianteIdForUser(Long estudianteId, Long idUsuario, java.util.Collection<String> roles);
    List<ExpedienteResponse> findByAsesorIdForUser(Long asesorId, Long idUsuario, java.util.Collection<String> roles);
    void disable(Long id, Long idUsuario);
    void emitirDictamen(Long idExpediente, String dictamenTexto, Long idUsuario);
}
