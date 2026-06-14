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

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteDocumento;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteEstado;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteDocumentoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteEstadoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SecretariaServiceImpl implements SecretariaService {

    private final EstudianteRepository estudianteRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ExpedienteDocumentoRepository documentoRepository;
    private final ExpedienteEstadoRepository estadoRepository;
    private final UsuarioRepository usuarioRepository;

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

    @Override
    @Transactional
    public void emitirCartaPresentacion(Long expedienteId, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(expedienteId)
                .orElseThrow(() -> new BusinessException("Expediente no encontrado"));
        Usuario usuario = usuarioRepository.findById(idUsuario).orElseThrow();
        
        ExpedienteDocumento doc = ExpedienteDocumento.builder()
                .expediente(expediente)
                .tipoDocumento("CARTA_PRESENTACION")
                .nombreArchivo("Carta_Presentacion_" + expediente.getCodigoExpediente() + ".pdf")
                .usuario(usuario)
                .build();
        documentoRepository.save(doc);
    }

    @Override
    @Transactional
    public void emitirConstancia(Long expedienteId, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(expedienteId)
                .orElseThrow(() -> new BusinessException("Expediente no encontrado"));
        Usuario usuario = usuarioRepository.findById(idUsuario).orElseThrow();
        
        ExpedienteDocumento doc = ExpedienteDocumento.builder()
                .expediente(expediente)
                .tipoDocumento("CONSTANCIA_CULMINACION")
                .nombreArchivo("Constancia_" + expediente.getCodigoExpediente() + ".pdf")
                .usuario(usuario)
                .build();
        documentoRepository.save(doc);
    }

    @Override
    @Transactional
    public void registrarIncidencia(Long expedienteId, String incidencia, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(expedienteId)
                .orElseThrow(() -> new BusinessException("Expediente no encontrado"));
        Usuario usuario = usuarioRepository.findById(idUsuario).orElseThrow();
        
        ExpedienteEstado estado = ExpedienteEstado.builder()
                .expediente(expediente)
                .estadoAnterior(expediente.getEstado())
                .estadoNuevo(expediente.getEstado())
                .usuario(usuario)
                .observacion("INCIDENCIA: " + incidencia)
                .tipoCambio("INCIDENCIA")
                .build();
        estadoRepository.save(estado);
    }

    private EstudianteDTO toDto(Estudiante entity) {
        var usuario = entity.getUsuario();
        return EstudianteDTO.builder()
                .id(entity.getId())
                .idUsuario(usuario != null ? usuario.getId() : null)
                .codigoEstudiantil(entity.getCodigoEstudiantil())
                .nombres(usuario != null ? usuario.getNombres() : null)
                .apellidoPaterno(usuario != null ? usuario.getApellidoPaterno() : null)
                .apellidoMaterno(usuario != null ? usuario.getApellidoMaterno() : null)
                .semestreActual(entity.getSemestreActual())
                .creditosAprobados(entity.getCreditosAprobados())
                .creditosRequeridosPractica(entity.getCreditosRequeridosPractica())
                .promedioPonderado(entity.getPromedioPonderado())
                .fechaIngreso(entity.getFechaIngreso())
                .estadoAcademico(entity.getEstadoAcademico())
                .build();
    }
}

