package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.TutorExternoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.TutorExternoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.TutorExternoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TutorExternoServiceImpl implements TutorExternoService {

    private final TutorExternoRepository tutorExternoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final SedePracticaRepository sedePracticaRepository;

    @Override
    @Transactional
    public TutorExternoDTO create(TutorExternoDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        
        if (tutorExternoRepository.findByUsuarioId(usuario.getId()).isPresent()) {
            throw new BusinessException("El usuario ya tiene un perfil de tutor externo");
        }

        Empresa empresa = null;
        if (dto.getIdEmpresa() != null) {
            empresa = empresaRepository.findById(dto.getIdEmpresa())
                    .orElseThrow(() -> new BusinessException("Empresa no encontrada"));
        }

        SedePractica sede = null;
        if (dto.getIdSede() != null) {
            sede = sedePracticaRepository.findById(dto.getIdSede())
                    .orElseThrow(() -> new BusinessException("Sede no encontrada"));
        }

        TutorExterno tutor = TutorExterno.builder()
                .usuario(usuario)
                .empresa(empresa)
                .sede(sede)
                .cargo(dto.getCargo())
                .area(dto.getArea())
                .empresaNombre(dto.getEmpresaNombre())
                .activo(true)
                .estadoTutor("ACTIVO")
                .build();

        return toDto(tutorExternoRepository.save(tutor));
    }

    @Override
    @Transactional
    public TutorExternoDTO update(Long id, TutorExternoDTO dto) {
        TutorExterno tutor = tutorExternoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tutor externo no encontrado"));

        if (dto.getIdEmpresa() != null) {
            Empresa empresa = empresaRepository.findById(dto.getIdEmpresa())
                    .orElseThrow(() -> new BusinessException("Empresa no encontrada"));
            tutor.setEmpresa(empresa);
        }

        if (dto.getIdSede() != null) {
            SedePractica sede = sedePracticaRepository.findById(dto.getIdSede())
                    .orElseThrow(() -> new BusinessException("Sede no encontrada"));
            tutor.setSede(sede);
        }

        tutor.setCargo(dto.getCargo());
        tutor.setArea(dto.getArea());
        tutor.setEmpresaNombre(dto.getEmpresaNombre());
        if (dto.getActivo() != null) {
            tutor.setActivo(dto.getActivo());
        }
        if (dto.getEstadoTutor() != null) {
            tutor.setEstadoTutor(dto.getEstadoTutor());
        }

        return toDto(tutorExternoRepository.save(tutor));
    }

    @Override
    @Transactional(readOnly = true)
    public TutorExternoDTO findById(Long id) {
        return tutorExternoRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new BusinessException("Tutor externo no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findAll() {
        return tutorExternoRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        TutorExterno tutor = tutorExternoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tutor externo no encontrado"));
        tutor.setActivo(false);
        tutorExternoRepository.save(tutor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findByEmpresaId(Long empresaId) {
        return tutorExternoRepository.findByEmpresaId(empresaId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findBySedeId(Long sedeId) {
        return tutorExternoRepository.findBySedeId(sedeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findByEmpresaIdAndEstadoTutor(Long empresaId, String estadoTutor) {
        return tutorExternoRepository.findByEmpresaIdAndEstadoTutor(empresaId, estadoTutor).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findBySedeIdAndEstadoTutor(Long sedeId, String estadoTutor) {
        return tutorExternoRepository.findBySedeIdAndEstadoTutor(sedeId, estadoTutor).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findActiveByEmpresaId(Long empresaId) {
        return tutorExternoRepository.findActiveByEmpresaId(empresaId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findActiveBySedeId(Long sedeId) {
        return tutorExternoRepository.findActiveBySedeId(sedeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TutorExternoDTO> findActiveByEmpresaOrSedeId(Long id) {
        return tutorExternoRepository.findActiveByEmpresaOrSedeId(id).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cambiarEstado(Long id, String estadoTutor) {
        TutorExterno tutor = tutorExternoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tutor externo no encontrado"));
        tutor.setEstadoTutor(estadoTutor);
        tutorExternoRepository.save(tutor);
    }

    private TutorExternoDTO toDto(TutorExterno entity) {
        return TutorExternoDTO.builder()
                .id(entity.getId())
                .idUsuario(entity.getUsuario().getId())
                .nombres(entity.getUsuario().getNombres())
                .apellidoPaterno(entity.getUsuario().getApellidoPaterno())
                .apellidoMaterno(entity.getUsuario().getApellidoMaterno())
                .correo(entity.getUsuario().getEmail())
                .telefono(entity.getUsuario().getTelefono())
                .idEmpresa(entity.getEmpresa() != null ? entity.getEmpresa().getId() : null)
                .razonSocialEmpresa(entity.getEmpresa() != null ? entity.getEmpresa().getRazonSocial() : null)
                .idSede(entity.getSede() != null ? entity.getSede().getId() : null)
                .nombreSede(entity.getSede() != null ? entity.getSede().getNombreSede() : null)
                .cargo(entity.getCargo())
                .area(entity.getArea())
                .empresaNombre(entity.getEmpresaNombre())
                .activo(entity.getActivo())
                .estadoTutor(entity.getEstadoTutor())
                .build();
    }
}

