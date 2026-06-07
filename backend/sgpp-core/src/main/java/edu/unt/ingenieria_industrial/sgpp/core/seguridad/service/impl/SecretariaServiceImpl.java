package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.EstadoAcademico;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ValidacionRequisitosDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.SecretariaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SecretariaServiceImpl implements SecretariaService {

    private final EstudianteRepository estudianteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EstudianteDTO> findAllEstudiantes() {
        return estudianteRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionRequisitosDTO validarRequisitos(Long estudianteId) {
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new BusinessException("Estudiante no encontrado"));

        boolean cumpleCreditos = estudiante.getCreditosAprobados() >= estudiante.getCreditosRequeridosPractica();
        boolean cumpleSemestre = estudiante.getSemestreActual() >= 8;
        boolean matriculaActiva = estudiante.getEstadoAcademico() == EstadoAcademico.ACTIVO;

        return ValidacionRequisitosDTO.builder()
                .cumpleCreditos(cumpleCreditos)
                .creditosActuales(estudiante.getCreditosAprobados())
                .creditosRequeridos(estudiante.getCreditosRequeridosPractica())
                .cumpleSemestre(cumpleSemestre)
                .semestreActual(estudiante.getSemestreActual())
                .semestreRequerido(8)
                .matriculaActiva(matriculaActiva)
                .estadoAcademico(estudiante.getEstadoAcademico().name())
                .aptoParaPracticas(cumpleCreditos && cumpleSemestre && matriculaActiva)
                .build();
    }

    @Override
    @Transactional
    public EstudianteDTO updateDatosAcademicos(Long estudianteId, EstudianteDTO dto) {
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new BusinessException("Estudiante no encontrado"));

        estudiante.setSemestreActual(dto.getSemestreActual());
        estudiante.setCreditosAprobados(dto.getCreditosAprobados());
        estudiante.setCreditosRequeridosPractica(dto.getCreditosRequeridosPractica());
        estudiante.setPromedioPonderado(dto.getPromedioPonderado());
        estudiante.setEstadoAcademico(dto.getEstadoAcademico());

        return toDto(estudianteRepository.save(estudiante));
    }

    private EstudianteDTO toDto(Estudiante entity) {
        return EstudianteDTO.builder()
                .id(entity.getId())
                .idUsuario(entity.getUsuario().getId())
                .codigoEstudiantil(entity.getCodigoEstudiantil())
                .semestreActual(entity.getSemestreActual())
                .creditosAprobados(entity.getCreditosAprobados())
                .creditosRequeridosPractica(entity.getCreditosRequeridosPractica())
                .promedioPonderado(entity.getPromedioPonderado())
                .fechaIngreso(entity.getFechaIngreso())
                .estadoAcademico(entity.getEstadoAcademico())
                .build();
    }
}

