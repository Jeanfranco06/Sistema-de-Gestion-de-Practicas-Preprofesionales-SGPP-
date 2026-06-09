package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.ValidacionSedeDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.ValidacionSede;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ValidacionSedeRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.ValidacionSedeService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ValidacionSedeServiceImpl implements ValidacionSedeService {

    private static final Set<String> RESULTADOS_VALIDOS = new HashSet<>(Arrays.asList("APROBADA", "OBSERVADA", "RECHAZADA"));

    private final ValidacionSedeRepository validacionSedeRepository;
    private final SedePracticaRepository sedePracticaRepository;
    private final UsuarioRepository usuarioRepository;

    public ValidacionSedeServiceImpl(ValidacionSedeRepository validacionSedeRepository,
                                      SedePracticaRepository sedePracticaRepository,
                                      UsuarioRepository usuarioRepository) {
        this.validacionSedeRepository = validacionSedeRepository;
        this.sedePracticaRepository = sedePracticaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public ValidacionSedeDTO create(ValidacionSedeDTO dto) {
        SedePractica sede = sedePracticaRepository.findById(dto.getSedeId())
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", dto.getSedeId()));

        Usuario validador = usuarioRepository.findById(dto.getUsuarioValidadorId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario validador", "id", dto.getUsuarioValidadorId()));

        if (dto.getCriterioInfraestructuraCumple() == null ||
            dto.getCriterioSeguridadSaludCumple() == null ||
            dto.getCriterioAfinidadCarreraCumple() == null ||
            dto.getCriterioTutorDesignadoCumple() == null ||
            dto.getCriterioConvenioAcuerdoCumple() == null) {
            throw new BusinessException("Todos los criterios de validación deben ser evaluados (marcar como cumplido o no)");
        }

        if (dto.getResultadoValidacion() == null || !RESULTADOS_VALIDOS.contains(dto.getResultadoValidacion())) {
            throw new BusinessException("El resultado de validación debe ser uno de: APROBADA, OBSERVADA, RECHAZADA");
        }

        if (dto.getFechaVigenciaDesde() == null) {
            throw new BusinessException("La fecha de inicio de vigencia es obligatoria");
        }
        if (dto.getFechaVigenciaHasta() == null) {
            throw new BusinessException("La fecha de fin de vigencia es obligatoria");
        }
        if (dto.getFechaVigenciaHasta().isBefore(dto.getFechaVigenciaDesde())) {
            throw new BusinessException("La fecha de fin de vigencia no puede ser anterior a la fecha de inicio");
        }

        ValidacionSede validacion = toEntity(dto);
        validacion.setSede(sede);
        validacion.setUsuarioValidador(validador);
        return toDto(validacionSedeRepository.save(validacion));
    }

    @Override
    @Transactional
    public ValidacionSedeDTO update(Long id, ValidacionSedeDTO dto) {
        ValidacionSede validacion = validacionSedeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Validación", "id", id));

        if (dto.getResultadoValidacion() != null && !RESULTADOS_VALIDOS.contains(dto.getResultadoValidacion())) {
            throw new BusinessException("El resultado de validación debe ser uno de: APROBADA, OBSERVADA, RECHAZADA");
        }

        validacion.setCriterioInfraestructuraCumple(dto.getCriterioInfraestructuraCumple());
        validacion.setCriterioInfraestructuraObservaciones(dto.getCriterioInfraestructuraObservaciones());
        validacion.setCriterioSeguridadSaludCumple(dto.getCriterioSeguridadSaludCumple());
        validacion.setCriterioSeguridadSaludObservaciones(dto.getCriterioSeguridadSaludObservaciones());
        validacion.setCriterioAfinidadCarreraCumple(dto.getCriterioAfinidadCarreraCumple());
        validacion.setCriterioAfinidadCarreraObservaciones(dto.getCriterioAfinidadCarreraObservaciones());
        validacion.setCriterioTutorDesignadoCumple(dto.getCriterioTutorDesignadoCumple());
        validacion.setCriterioTutorDesignadoObservaciones(dto.getCriterioTutorDesignadoObservaciones());
        validacion.setCriterioConvenioAcuerdoCumple(dto.getCriterioConvenioAcuerdoCumple());
        validacion.setCriterioConvenioAcuerdoObservaciones(dto.getCriterioConvenioAcuerdoObservaciones());

        validacion.setOtroCriterio1Nombre(dto.getOtroCriterio1Nombre());
        validacion.setOtroCriterio1Cumple(dto.getOtroCriterio1Cumple());
        validacion.setOtroCriterio1Observaciones(dto.getOtroCriterio1Observaciones());
        validacion.setOtroCriterio2Nombre(dto.getOtroCriterio2Nombre());
        validacion.setOtroCriterio2Cumple(dto.getOtroCriterio2Cumple());
        validacion.setOtroCriterio2Observaciones(dto.getOtroCriterio2Observaciones());

        validacion.setResultadoValidacion(dto.getResultadoValidacion());
        validacion.setObservacionesGenerales(dto.getObservacionesGenerales());

        if (dto.getFechaVigenciaDesde() != null && dto.getFechaVigenciaHasta() != null) {
            if (dto.getFechaVigenciaHasta().isBefore(dto.getFechaVigenciaDesde())) {
                throw new BusinessException("La fecha de fin de vigencia no puede ser anterior a la fecha de inicio");
            }
            validacion.setFechaVigenciaDesde(dto.getFechaVigenciaDesde());
            validacion.setFechaVigenciaHasta(dto.getFechaVigenciaHasta());
        }

        return toDto(validacionSedeRepository.save(validacion));
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionSedeDTO findById(Long id) {
        return validacionSedeRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Validación", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ValidacionSedeDTO> findBySedeId(Long sedeId) {
        return validacionSedeRepository.findBySedeId(sedeId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ValidacionSedeDTO> findHistorialBySedeId(Long sedeId) {
        return validacionSedeRepository.findBySedeIdOrderByFechaValidacionDesc(sedeId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionSedeDTO findValidacionVigente(Long sedeId) {
        LocalDate hoy = LocalDate.now();
        Optional<ValidacionSede> validacion = validacionSedeRepository.findValidacionVigente(sedeId, hoy);
        return validacion.map(this::toDto).orElse(null);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ValidacionSede validacion = validacionSedeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Validación", "id", id));
        validacionSedeRepository.delete(validacion);
    }

    private ValidacionSede toEntity(ValidacionSedeDTO dto) {
        return ValidacionSede.builder()
                .criterioInfraestructuraCumple(dto.getCriterioInfraestructuraCumple())
                .criterioInfraestructuraObservaciones(dto.getCriterioInfraestructuraObservaciones())
                .criterioSeguridadSaludCumple(dto.getCriterioSeguridadSaludCumple())
                .criterioSeguridadSaludObservaciones(dto.getCriterioSeguridadSaludObservaciones())
                .criterioAfinidadCarreraCumple(dto.getCriterioAfinidadCarreraCumple())
                .criterioAfinidadCarreraObservaciones(dto.getCriterioAfinidadCarreraObservaciones())
                .criterioTutorDesignadoCumple(dto.getCriterioTutorDesignadoCumple())
                .criterioTutorDesignadoObservaciones(dto.getCriterioTutorDesignadoObservaciones())
                .criterioConvenioAcuerdoCumple(dto.getCriterioConvenioAcuerdoCumple())
                .criterioConvenioAcuerdoObservaciones(dto.getCriterioConvenioAcuerdoObservaciones())
                .otroCriterio1Nombre(dto.getOtroCriterio1Nombre())
                .otroCriterio1Cumple(dto.getOtroCriterio1Cumple())
                .otroCriterio1Observaciones(dto.getOtroCriterio1Observaciones())
                .otroCriterio2Nombre(dto.getOtroCriterio2Nombre())
                .otroCriterio2Cumple(dto.getOtroCriterio2Cumple())
                .otroCriterio2Observaciones(dto.getOtroCriterio2Observaciones())
                .resultadoValidacion(dto.getResultadoValidacion())
                .observacionesGenerales(dto.getObservacionesGenerales())
                .fechaVigenciaDesde(dto.getFechaVigenciaDesde())
                .fechaVigenciaHasta(dto.getFechaVigenciaHasta())
                .build();
    }

    private ValidacionSedeDTO toDto(ValidacionSede entity) {
        return ValidacionSedeDTO.builder()
                .id(entity.getId())
                .sedeId(entity.getSede().getId())
                .nombreSede(entity.getSede().getNombreSede())
                .usuarioValidadorId(entity.getUsuarioValidador().getId())
                .nombreValidador(entity.getUsuarioValidador().getNombres() + " " + entity.getUsuarioValidador().getApellidoPaterno())
                .fechaValidacion(entity.getFechaValidacion())
                .criterioInfraestructuraCumple(entity.getCriterioInfraestructuraCumple())
                .criterioInfraestructuraObservaciones(entity.getCriterioInfraestructuraObservaciones())
                .criterioSeguridadSaludCumple(entity.getCriterioSeguridadSaludCumple())
                .criterioSeguridadSaludObservaciones(entity.getCriterioSeguridadSaludObservaciones())
                .criterioAfinidadCarreraCumple(entity.getCriterioAfinidadCarreraCumple())
                .criterioAfinidadCarreraObservaciones(entity.getCriterioAfinidadCarreraObservaciones())
                .criterioTutorDesignadoCumple(entity.getCriterioTutorDesignadoCumple())
                .criterioTutorDesignadoObservaciones(entity.getCriterioTutorDesignadoObservaciones())
                .criterioConvenioAcuerdoCumple(entity.getCriterioConvenioAcuerdoCumple())
                .criterioConvenioAcuerdoObservaciones(entity.getCriterioConvenioAcuerdoObservaciones())
                .otroCriterio1Nombre(entity.getOtroCriterio1Nombre())
                .otroCriterio1Cumple(entity.getOtroCriterio1Cumple())
                .otroCriterio1Observaciones(entity.getOtroCriterio1Observaciones())
                .otroCriterio2Nombre(entity.getOtroCriterio2Nombre())
                .otroCriterio2Cumple(entity.getOtroCriterio2Cumple())
                .otroCriterio2Observaciones(entity.getOtroCriterio2Observaciones())
                .resultadoValidacion(entity.getResultadoValidacion())
                .observacionesGenerales(entity.getObservacionesGenerales())
                .fechaVigenciaDesde(entity.getFechaVigenciaDesde())
                .fechaVigenciaHasta(entity.getFechaVigenciaHasta())
                .build();
    }
}
