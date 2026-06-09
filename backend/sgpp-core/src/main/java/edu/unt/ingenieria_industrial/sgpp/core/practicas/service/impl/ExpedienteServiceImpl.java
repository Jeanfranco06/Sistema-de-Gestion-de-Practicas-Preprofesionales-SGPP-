package edu.unt.ingenieria_industrial.sgpp.core.practicas.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.ExpedienteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.ExpedienteService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.TutorExternoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpedienteServiceImpl implements ExpedienteService {

    private final ExpedienteRepository expedienteRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorExternoRepository tutorExternoRepository;

    @Override
    @Transactional
    public ExpedienteDTO create(ExpedienteDTO dto) {
        Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new BusinessException("Estudiante no encontrado"));

        TutorExterno tutorEmpresa = null;
        if (dto.getIdTutorEmpresa() != null) {
            tutorEmpresa = tutorExternoRepository.findById(dto.getIdTutorEmpresa())
                    .orElseThrow(() -> new BusinessException("Tutor de empresa no encontrado"));
            
            // Validar que el tutor esté activo
            if (!"ACTIVO".equals(tutorEmpresa.getEstadoTutor()) || !tutorEmpresa.getActivo()) {
                throw new BusinessException("El tutor de empresa seleccionado no está activo. Registre o asigne un tutor activo antes de continuar.");
            }
        } else {
            throw new BusinessException("La empresa/sede seleccionada no tiene un tutor de empresa activo designado. Registre o asigne un tutor antes de continuar.");
        }

        Expediente expediente = Expediente.builder()
                .estudiante(estudiante)
                .tutorEmpresa(tutorEmpresa)
                .numeroExpediente(dto.getNumeroExpediente())
                .fechaApertura(dto.getFechaApertura())
                .fechaCierre(dto.getFechaCierre())
                .estado(dto.getEstado())
                .observaciones(dto.getObservaciones())
                .activo(true)
                .build();

        return toDto(expedienteRepository.save(expediente));
    }

    @Override
    @Transactional
    public ExpedienteDTO update(Long id, ExpedienteDTO dto) {
        Expediente expediente = expedienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Expediente no encontrado"));

        if (dto.getIdTutorEmpresa() != null) {
            TutorExterno tutorEmpresa = tutorExternoRepository.findById(dto.getIdTutorEmpresa())
                    .orElseThrow(() -> new BusinessException("Tutor de empresa no encontrado"));
            
            // Validar que el tutor esté activo
            if (!"ACTIVO".equals(tutorEmpresa.getEstadoTutor()) || !tutorEmpresa.getActivo()) {
                throw new BusinessException("El tutor de empresa seleccionado no está activo. Registre o asigne un tutor activo antes de continuar.");
            }
            
            expediente.setTutorEmpresa(tutorEmpresa);
        }

        expediente.setNumeroExpediente(dto.getNumeroExpediente());
        expediente.setFechaApertura(dto.getFechaApertura());
        expediente.setFechaCierre(dto.getFechaCierre());
        expediente.setEstado(dto.getEstado());
        expediente.setObservaciones(dto.getObservaciones());

        return toDto(expedienteRepository.save(expediente));
    }

    @Override
    @Transactional(readOnly = true)
    public ExpedienteDTO findById(Long id) {
        return expedienteRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new BusinessException("Expediente no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteDTO> findAll() {
        return expedienteRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteDTO> findByEstudianteId(Long estudianteId) {
        return expedienteRepository.findByEstudianteIdAndActivoTrue(estudianteId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteDTO> findByTutorEmpresaId(Long tutorEmpresaId) {
        return expedienteRepository.findByTutorEmpresaIdAndActivoTrue(tutorEmpresaId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        Expediente expediente = expedienteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Expediente no encontrado"));
        expediente.setActivo(false);
        expedienteRepository.save(expediente);
    }

    private ExpedienteDTO toDto(Expediente entity) {
        return ExpedienteDTO.builder()
                .id(entity.getId())
                .idEstudiante(entity.getEstudiante().getId())
                .nombreEstudiante(entity.getEstudiante().getUsuario().getNombres() + " " + 
                                   entity.getEstudiante().getUsuario().getApellidoPaterno())
                .idTutorEmpresa(entity.getTutorEmpresa() != null ? entity.getTutorEmpresa().getId() : null)
                .nombreTutorEmpresa(entity.getTutorEmpresa() != null ? 
                                   entity.getTutorEmpresa().getUsuario().getNombres() + " " + 
                                   entity.getTutorEmpresa().getUsuario().getApellidoPaterno() : null)
                .numeroExpediente(entity.getNumeroExpediente())
                .fechaApertura(entity.getFechaApertura())
                .fechaCierre(entity.getFechaCierre())
                .estado(entity.getEstado())
                .observaciones(entity.getObservaciones())
                .activo(entity.getActivo())
                .build();
    }
}
