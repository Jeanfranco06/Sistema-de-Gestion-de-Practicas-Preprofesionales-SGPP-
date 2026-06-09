package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ComiteIntegranteRequest;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ComiteIntegranteResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.ComiteIntegrante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Docente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.ComiteIntegranteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.DocenteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.ComiteIntegranteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComiteIntegranteServiceImpl implements ComiteIntegranteService {

    private final ComiteIntegranteRepository comiteIntegranteRepository;
    private final UsuarioRepository usuarioRepository;
    private final DocenteRepository docenteRepository;

    @Override
    @Transactional
    public ComiteIntegranteResponse create(ComiteIntegranteRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        Docente docente = null;
        if (request.getIdDocente() != null) {
            docente = docenteRepository.findById(request.getIdDocente())
                    .orElseThrow(() -> new BusinessException("Docente no encontrado"));
        }

        if (request.getRolComite() == ComiteIntegrante.RolComite.PRESIDENTE) {
            List<ComiteIntegrante> existingPresidents = comiteIntegranteRepository.findAllActive();
            boolean hasActivePresident = existingPresidents.stream()
                    .anyMatch(ci -> ci.getRolComite() == ComiteIntegrante.RolComite.PRESIDENTE);
            if (hasActivePresident) {
                throw new BusinessException("Ya existe un presidente activo en el comité");
            }
        }

        ComiteIntegrante integrante = ComiteIntegrante.builder()
                .usuario(usuario)
                .docente(docente)
                .rolComite(request.getRolComite())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .estado("ACTIVO")
                .resolucionDesignacion(request.getResolucionDesignacion())
                .periodoAcademico(request.getPeriodoAcademico())
                .build();

        ComiteIntegrante saved = comiteIntegranteRepository.save(integrante);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ComiteIntegranteResponse update(Long id, ComiteIntegranteRequest request) {
        ComiteIntegrante integrante = comiteIntegranteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Integrante no encontrado"));

        if (request.getRolComite() == ComiteIntegrante.RolComite.PRESIDENTE && 
            integrante.getRolComite() != ComiteIntegrante.RolComite.PRESIDENTE) {
            List<ComiteIntegrante> existingPresidents = comiteIntegranteRepository.findAllActive();
            boolean hasActivePresident = existingPresidents.stream()
                    .anyMatch(ci -> ci.getRolComite() == ComiteIntegrante.RolComite.PRESIDENTE && !ci.getId().equals(id));
            if (hasActivePresident) {
                throw new BusinessException("Ya existe un presidente activo en el comité");
            }
        }

        if (request.getFechaInicio() != null) {
            integrante.setFechaInicio(request.getFechaInicio());
        }
        if (request.getFechaFin() != null) {
            integrante.setFechaFin(request.getFechaFin());
        }
        if (request.getRolComite() != null) {
            integrante.setRolComite(request.getRolComite());
        }
        if (request.getResolucionDesignacion() != null) {
            integrante.setResolucionDesignacion(request.getResolucionDesignacion());
        }
        if (request.getPeriodoAcademico() != null) {
            integrante.setPeriodoAcademico(request.getPeriodoAcademico());
        }

        ComiteIntegrante saved = comiteIntegranteRepository.save(integrante);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ComiteIntegranteResponse findById(Long id) {
        return comiteIntegranteRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("Integrante no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComiteIntegranteResponse> findAll() {
        return comiteIntegranteRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComiteIntegranteResponse> findAllActive() {
        return comiteIntegranteRepository.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComiteIntegranteResponse> findByPeriodo(String periodo) {
        return comiteIntegranteRepository.findByPeriodoAcademico(periodo).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateEstado(Long id, String estado) {
        ComiteIntegrante integrante = comiteIntegranteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Integrante no encontrado"));
        integrante.setEstado(estado);
        comiteIntegranteRepository.save(integrante);
    }

    @Override
    @Transactional(readOnly = true)
    public ComiteIntegranteResponse findPresidente() {
        return comiteIntegranteRepository.findActivePresidente(ComiteIntegrante.RolComite.PRESIDENTE)
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("No hay presidente activo en el comité"));
    }

    @Override
    @Transactional
    public void cerrarPeriodo(String periodo) {
        List<ComiteIntegrante> integrantes = comiteIntegranteRepository.findByPeriodoAcademico(periodo);
        if (integrantes.isEmpty()) {
            throw new BusinessException("No hay integrantes registrados para el período: " + periodo);
        }
        for (ComiteIntegrante ci : integrantes) {
            ci.setEstado("INACTIVO");
            ci.setFechaFin(LocalDate.now());
        }
        comiteIntegranteRepository.saveAll(integrantes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComiteIntegranteResponse> getVigente() {
        return comiteIntegranteRepository.findAllActive().stream()
                .filter(ci -> ci.getFechaInicio() != null &&
                        !ci.getFechaInicio().isAfter(LocalDate.now()) &&
                        (ci.getFechaFin() == null || !ci.getFechaFin().isBefore(LocalDate.now())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ComiteIntegranteResponse toResponse(ComiteIntegrante integrante) {
        return ComiteIntegranteResponse.builder()
                .id(integrante.getId())
                .idUsuario(integrante.getUsuario() != null ? integrante.getUsuario().getId() : null)
                .nombres(integrante.getUsuario() != null ? integrante.getUsuario().getNombres() : null)
                .apellidos(integrante.getUsuario() != null ? 
                        integrante.getUsuario().getApellidoPaterno() + " " + 
                        (integrante.getUsuario().getApellidoMaterno() != null ? integrante.getUsuario().getApellidoMaterno() : "") : null)
                .email(integrante.getUsuario() != null ? integrante.getUsuario().getEmail() : null)
                .idDocente(integrante.getDocente() != null ? integrante.getDocente().getId() : null)
                .codigoDocente(integrante.getDocente() != null ? integrante.getDocente().getCodigoDocente() : null)
                .rolComite(integrante.getRolComite())
                .fechaInicio(integrante.getFechaInicio())
                .fechaFin(integrante.getFechaFin())
                .estado(integrante.getEstado())
                .resolucionDesignacion(integrante.getResolucionDesignacion())
                .periodoAcademico(integrante.getPeriodoAcademico())
                .build();
    }
}
