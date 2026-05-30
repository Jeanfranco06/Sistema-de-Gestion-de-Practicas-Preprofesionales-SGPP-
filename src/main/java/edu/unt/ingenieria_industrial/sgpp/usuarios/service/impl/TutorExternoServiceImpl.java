package edu.unt.ingenieria_industrial.sgpp.usuarios.service.impl;

import edu.unt.ingenieria_industrial.sgpp.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.TutorExternoDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.TutorExterno;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.usuarios.repository.TutorExternoRepository;
import edu.unt.ingenieria_industrial.sgpp.usuarios.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.usuarios.service.TutorExternoService;
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

    @Override
    @Transactional
    public TutorExternoDTO create(TutorExternoDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        
        if (tutorExternoRepository.findByUsuarioId(usuario.getId()).isPresent()) {
            throw new BusinessException("El usuario ya tiene un perfil de tutor externo");
        }

        TutorExterno tutor = TutorExterno.builder()
                .usuario(usuario)
                .cargo(dto.getCargo())
                .area(dto.getArea())
                .empresaNombre(dto.getEmpresaNombre())
                .activo(true)
                .build();

        return toDto(tutorExternoRepository.save(tutor));
    }

    @Override
    @Transactional
    public TutorExternoDTO update(Long id, TutorExternoDTO dto) {
        TutorExterno tutor = tutorExternoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tutor externo no encontrado"));

        tutor.setCargo(dto.getCargo());
        tutor.setArea(dto.getArea());
        tutor.setEmpresaNombre(dto.getEmpresaNombre());
        tutor.setActivo(dto.getActivo());

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

    private TutorExternoDTO toDto(TutorExterno entity) {
        return TutorExternoDTO.builder()
                .id(entity.getId())
                .idUsuario(entity.getUsuario().getId())
                .cargo(entity.getCargo())
                .area(entity.getArea())
                .empresaNombre(entity.getEmpresaNombre())
                .activo(entity.getActivo())
                .build();
    }
}
