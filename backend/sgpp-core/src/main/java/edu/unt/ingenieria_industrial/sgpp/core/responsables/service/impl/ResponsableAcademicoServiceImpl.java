package edu.unt.ingenieria_industrial.sgpp.core.responsables.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.model.AsignacionAsesor;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.model.DesignacionCoordinador;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.repository.AsignacionAsesorRepository;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.repository.DesignacionCoordinadorRepository;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.service.ResponsableAcademicoService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.ComiteIntegrante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Docente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.ComiteIntegranteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.DocenteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResponsableAcademicoServiceImpl implements ResponsableAcademicoService {

    private final AsignacionAsesorRepository asignacionAsesorRepository;
    private final DesignacionCoordinadorRepository designacionCoordinadorRepository;
    private final DocenteRepository docenteRepository;
    private final EstudianteRepository estudianteRepository;
    private final TipoPracticaRepository tipoPracticaRepository;
    private final ComiteIntegranteRepository comiteIntegranteRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public AsignacionAsesorResponse asignarAsesor(AsignacionAsesorRequest request) {
        Docente docente = docenteRepository.findById(request.getIdDocente())
                .orElseThrow(() -> new BusinessException("Docente no encontrado con ID: " + request.getIdDocente()));

        Estudiante estudiante = estudianteRepository.findById(request.getIdEstudiante())
                .orElseThrow(() -> new BusinessException("Estudiante no encontrado con ID: " + request.getIdEstudiante()));

        TipoPractica tipoPractica = tipoPracticaRepository.findByCodigo(request.getCodigoTipoPractica())
                .orElseThrow(() -> new BusinessException("Tipo de práctica no encontrado con código: " + request.getCodigoTipoPractica()));

        asignacionAsesorRepository.findActiveByEstudianteId(request.getIdEstudiante(), LocalDate.now())
                .ifPresent(a -> {
                    throw new BusinessException("El estudiante ya tiene un asesor activo asignado");
                });

        AsignacionAsesor asignacion = AsignacionAsesor.builder()
                .docente(docente)
                .estudiante(estudiante)
                .tipoPractica(tipoPractica)
                .periodoAcademico(request.getPeriodoAcademico())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .resolucionDesignacion(request.getResolucionDesignacion())
                .estado("ACTIVO")
                .build();

        AsignacionAsesor saved = asignacionAsesorRepository.save(asignacion);
        return toAsignacionResponse(saved);
    }

    @Override
    @Transactional
    public AsignacionAsesorResponse reasignarAsesor(ReasignarAsesorRequest request) {
        AsignacionAsesor asignacionActual = asignacionAsesorRepository.findById(request.getIdAsignacionActual())
                .orElseThrow(() -> new BusinessException("Asignación no encontrada con ID: " + request.getIdAsignacionActual()));

        if (!"ACTIVO".equals(asignacionActual.getEstado())) {
            throw new BusinessException("La asignación actual no está activa, no se puede reasignar");
        }

        Docente nuevoDocente = docenteRepository.findById(request.getIdDocenteNuevo())
                .orElseThrow(() -> new BusinessException("Docente no encontrado con ID: " + request.getIdDocenteNuevo()));

        asignacionActual.setFechaFin(request.getFechaReasignacion());
        asignacionActual.setEstado("REASIGNADO");
        asignacionAsesorRepository.save(asignacionActual);

        AsignacionAsesor nuevaAsignacion = AsignacionAsesor.builder()
                .docente(nuevoDocente)
                .estudiante(asignacionActual.getEstudiante())
                .tipoPractica(asignacionActual.getTipoPractica())
                .periodoAcademico(asignacionActual.getPeriodoAcademico())
                .fechaInicio(request.getFechaReasignacion())
                .fechaFin(null)
                .resolucionDesignacion(request.getResolucionDesignacion())
                .motivoReasignacion(request.getMotivoReasignacion())
                .estado("ACTIVO")
                .build();

        AsignacionAsesor saved = asignacionAsesorRepository.save(nuevaAsignacion);
        return toAsignacionResponse(saved);
    }

    @Override
    @Transactional
    public void finalizarAsignacionAsesor(Long idAsignacion) {
        AsignacionAsesor asignacion = asignacionAsesorRepository.findById(idAsignacion)
                .orElseThrow(() -> new BusinessException("Asignación no encontrada con ID: " + idAsignacion));
        asignacion.setFechaFin(LocalDate.now());
        asignacion.setEstado("FINALIZADO");
        asignacionAsesorRepository.save(asignacion);
    }

    @Override
    @Transactional(readOnly = true)
    public AsignacionAsesorResponse findAsignacionById(Long id) {
        return asignacionAsesorRepository.findById(id)
                .map(this::toAsignacionResponse)
                .orElseThrow(() -> new BusinessException("Asignación no encontrada con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public AsignacionAsesorResponse findAsignacionActivaByEstudiante(Long idEstudiante) {
        return asignacionAsesorRepository.findActiveByEstudianteId(idEstudiante, LocalDate.now())
                .map(this::toAsignacionResponse)
                .orElseThrow(() -> new BusinessException("No se encontró una asignación activa para el estudiante"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AsignacionAsesorResponse> listarAsignacionesPorDocente(Long idDocente) {
        return asignacionAsesorRepository.findByDocenteIdAndActivoTrue(idDocente).stream()
                .map(this::toAsignacionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DesignacionCoordinadorResponse designarCoordinador(DesignacionCoordinadorRequest request) {
        Docente docente = docenteRepository.findById(request.getIdDocente())
                .orElseThrow(() -> new BusinessException("Docente no encontrado con ID: " + request.getIdDocente()));

        designacionCoordinadorRepository.findActiveByPeriodo(request.getPeriodoAcademico(), LocalDate.now())
                .ifPresent(d -> {
                    throw new BusinessException("Ya existe un coordinador activo para el período: " + request.getPeriodoAcademico());
                });

        DesignacionCoordinador designacion = DesignacionCoordinador.builder()
                .docente(docente)
                .periodoAcademico(request.getPeriodoAcademico())
                .fechaDesignacion(request.getFechaDesignacion())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .resolucionDesignacion(request.getResolucionDesignacion())
                .observaciones(request.getObservaciones())
                .estado("ACTIVO")
                .build();

        DesignacionCoordinador saved = designacionCoordinadorRepository.save(designacion);
        return toCoordinadorResponse(saved);
    }

    @Override
    @Transactional
    public void finalizarDesignacionCoordinador(Long idDesignacion) {
        DesignacionCoordinador designacion = designacionCoordinadorRepository.findById(idDesignacion)
                .orElseThrow(() -> new BusinessException("Designación no encontrada con ID: " + idDesignacion));
        designacion.setFechaFin(LocalDate.now());
        designacion.setEstado("FINALIZADO");
        designacionCoordinadorRepository.save(designacion);
    }

    @Override
    @Transactional(readOnly = true)
    public DesignacionCoordinadorResponse findDesignacionById(Long id) {
        return designacionCoordinadorRepository.findById(id)
                .map(this::toCoordinadorResponse)
                .orElseThrow(() -> new BusinessException("Designación no encontrada con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public DesignacionCoordinadorResponse findCoordinadorVigente() {
        return designacionCoordinadorRepository.findVigente(LocalDate.now())
                .map(this::toCoordinadorResponse)
                .orElseThrow(() -> new BusinessException("No hay un coordinador vigente"));
    }

    @Override
    @Transactional(readOnly = true)
    public DesignacionCoordinadorResponse findCoordinadorByPeriodo(String periodo) {
        return designacionCoordinadorRepository.findActiveByPeriodo(periodo, LocalDate.now())
                .map(this::toCoordinadorResponse)
                .orElseThrow(() -> new BusinessException("No se encontró un coordinador activo para el período: " + periodo));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DesignacionCoordinadorResponse> listarDesignacionesPorPeriodo(String periodo) {
        return designacionCoordinadorRepository.findByPeriodoAcademico(periodo).stream()
                .map(this::toCoordinadorResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResponsableVigenteDTO obtenerResponsablesVigentes() {
        DesignacionCoordinadorResponse coordinador = designacionCoordinadorRepository.findVigente(LocalDate.now())
                .map(this::toCoordinadorResponse)
                .orElse(null);

        List<ResponsableVigenteDTO.ComiteResponse> comite = comiteIntegranteRepository.findVigentes(LocalDate.now()).stream()
                .map(this::toComiteResponse)
                .collect(Collectors.toList());

        return ResponsableVigenteDTO.builder()
                .coordinador(coordinador)
                .comite(comite)
                .totalIntegrantesComite(comite.size())
                .limiteIntegrantes(3)
                .build();
    }

    private AsignacionAsesorResponse toAsignacionResponse(AsignacionAsesor asignacion) {
        Docente docente = asignacion.getDocente();
        Estudiante estudiante = asignacion.getEstudiante();
        Usuario usuarioDocente = docente != null ? docente.getUsuario() : null;
        Usuario usuarioEstudiante = estudiante != null ? estudiante.getUsuario() : null;

        return AsignacionAsesorResponse.builder()
                .id(asignacion.getId())
                .idDocente(docente != null ? docente.getId() : null)
                .codigoDocente(docente != null ? docente.getCodigoDocente() : null)
                .nombresDocente(usuarioDocente != null ? usuarioDocente.getNombres() : null)
                .apellidosDocente(usuarioDocente != null ?
                        usuarioDocente.getApellidoPaterno() + " " +
                        (usuarioDocente.getApellidoMaterno() != null ? usuarioDocente.getApellidoMaterno() : "") : null)
                .categoriaDocente(docente != null ? docente.getCategoria() : null)
                .idEstudiante(estudiante != null ? estudiante.getId() : null)
                .codigoEstudiantil(estudiante != null ? estudiante.getCodigoEstudiantil() : null)
                .nombresEstudiante(usuarioEstudiante != null ? usuarioEstudiante.getNombres() : null)
                .apellidosEstudiante(usuarioEstudiante != null ?
                        usuarioEstudiante.getApellidoPaterno() + " " +
                        (usuarioEstudiante.getApellidoMaterno() != null ? usuarioEstudiante.getApellidoMaterno() : "") : null)
                .tipoPractica(asignacion.getTipoPractica() != null ? asignacion.getTipoPractica().getCodigo() : null)
                .periodoAcademico(asignacion.getPeriodoAcademico())
                .fechaInicio(asignacion.getFechaInicio())
                .fechaFin(asignacion.getFechaFin())
                .estado(asignacion.getEstado())
                .resolucionDesignacion(asignacion.getResolucionDesignacion())
                .motivoReasignacion(asignacion.getMotivoReasignacion())
                .build();
    }

    private DesignacionCoordinadorResponse toCoordinadorResponse(DesignacionCoordinador designacion) {
        Docente docente = designacion.getDocente();
        Usuario usuario = docente != null ? docente.getUsuario() : null;

        return DesignacionCoordinadorResponse.builder()
                .id(designacion.getId())
                .idDocente(docente != null ? docente.getId() : null)
                .codigoDocente(docente != null ? docente.getCodigoDocente() : null)
                .nombresDocente(usuario != null ? usuario.getNombres() : null)
                .apellidosDocente(usuario != null ?
                        usuario.getApellidoPaterno() + " " +
                        (usuario.getApellidoMaterno() != null ? usuario.getApellidoMaterno() : "") : null)
                .categoriaDocente(docente != null ? docente.getCategoria() : null)
                .periodoAcademico(designacion.getPeriodoAcademico())
                .fechaDesignacion(designacion.getFechaDesignacion())
                .fechaInicio(designacion.getFechaInicio())
                .fechaFin(designacion.getFechaFin())
                .estado(designacion.getEstado())
                .resolucionDesignacion(designacion.getResolucionDesignacion())
                .observaciones(designacion.getObservaciones())
                .build();
    }

    private ResponsableVigenteDTO.ComiteResponse toComiteResponse(ComiteIntegrante ci) {
        Usuario usuario = ci.getUsuario();
        Docente docente = ci.getDocente();

        return ResponsableVigenteDTO.ComiteResponse.builder()
                .id(ci.getId())
                .idUsuario(usuario != null ? usuario.getId() : null)
                .nombres(usuario != null ? usuario.getNombres() : null)
                .apellidos(usuario != null ?
                        usuario.getApellidoPaterno() + " " +
                        (usuario.getApellidoMaterno() != null ? usuario.getApellidoMaterno() : "") : null)
                .email(usuario != null ? usuario.getEmail() : null)
                .idDocente(docente != null ? docente.getId() : null)
                .codigoDocente(docente != null ? docente.getCodigoDocente() : null)
                .categoriaDocente(docente != null ? docente.getCategoria() : null)
                .rol(ci.getRolComite() != null ? ci.getRolComite().name() : null)
                .fechaInicio(ci.getFechaInicio())
                .fechaFin(ci.getFechaFin())
                .resolucionDesignacion(ci.getResolucionDesignacion())
                .periodoAcademico(ci.getPeriodoAcademico())
                .build();
    }
}
