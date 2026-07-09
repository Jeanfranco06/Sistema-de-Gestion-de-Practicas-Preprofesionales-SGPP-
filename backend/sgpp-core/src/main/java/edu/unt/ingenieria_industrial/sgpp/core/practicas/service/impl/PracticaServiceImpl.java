package edu.unt.ingenieria_industrial.sgpp.core.practicas.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.SedeElegibilidadService;
import edu.unt.ingenieria_industrial.sgpp.core.model.EstadoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.PracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.Practica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.PracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.PracticaService;
import edu.unt.ingenieria_industrial.sgpp.core.repository.EstadoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PracticaServiceImpl implements PracticaService {

    private final PracticaRepository practicaRepository;
    private final EstudianteRepository estudianteRepository;
    private final SedePracticaRepository sedePracticaRepository;
    private final EstadoPracticaRepository estadoPracticaRepository;
    private final SedeElegibilidadService sedeElegibilidadService;
    private final TipoPracticaRepository tipoPracticaRepository;

    public PracticaServiceImpl(PracticaRepository practicaRepository,
                                EstudianteRepository estudianteRepository,
                                SedePracticaRepository sedePracticaRepository,
                                EstadoPracticaRepository estadoPracticaRepository,
                                SedeElegibilidadService sedeElegibilidadService,
                                TipoPracticaRepository tipoPracticaRepository) {
        this.practicaRepository = practicaRepository;
        this.estudianteRepository = estudianteRepository;
        this.sedePracticaRepository = sedePracticaRepository;
        this.estadoPracticaRepository = estadoPracticaRepository;
        this.sedeElegibilidadService = sedeElegibilidadService;
        this.tipoPracticaRepository = tipoPracticaRepository;
    }

    @Override
    @Transactional
    public PracticaDTO seleccionarSede(Long estudianteId, Long sedeId) {
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante", "id", estudianteId));

        SedePractica sede = sedePracticaRepository.findById(sedeId)
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", sedeId));

        Optional<Practica> existing = practicaRepository.findByEstudianteIdAndActivoTrue(estudianteId);
        if (existing.isPresent()) {
            throw new BusinessException("El estudiante ya tiene una práctica activa. Debe finalizarla antes de seleccionar una nueva sede.");
        }

        SedeElegibilidadService.ResultadoElegibilidad elegibilidad =
                sedeElegibilidadService.evaluarElegibilidad(sede);
        if (!elegibilidad.isElegible()) {
            throw new BusinessException("La sede no está disponible para selección: " + elegibilidad.getMotivoResumen());
        }

        EstadoPractica estadoRegistrada = estadoPracticaRepository.findByCodigo("REGISTRADA")
                .orElseThrow(() -> new RuntimeException("Estado REGISTRADA no configurado en el sistema"));

        Practica practica = Practica.builder()
                .estudiante(estudiante)
                .sede(sede)
                .estado(estadoRegistrada)
                .fechaInicio(LocalDate.now())
                .fechaFin(LocalDate.now().plusMonths(6))
                .activo(true)
                .build();

        return toDto(practicaRepository.save(practica));
    }

    @Override
    @Transactional
    public PracticaDTO solicitarPractica(Long estudianteId, Long sedeId, Long tipoPracticaId) {
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante", "id", estudianteId));

        SedePractica sede = sedePracticaRepository.findById(sedeId)
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", sedeId));

        TipoPractica tipoPractica = tipoPracticaRepository.findById(tipoPracticaId)
                .orElseThrow(() -> new ResourceNotFoundException("TipoPractica", "id", tipoPracticaId));

        if (!Boolean.TRUE.equals(tipoPractica.getActivo())) {
            throw new BusinessException("El tipo de práctica seleccionado no está disponible actualmente.");
        }

        Optional<Practica> existing = practicaRepository.findByEstudianteIdAndActivoTrue(estudianteId);
        if (existing.isPresent()) {
            throw new BusinessException("El estudiante ya tiene una práctica activa. Debe finalizarla antes de solicitar una nueva.");
        }

        SedeElegibilidadService.ResultadoElegibilidad elegibilidad =
                sedeElegibilidadService.evaluarElegibilidad(sede);
        if (!elegibilidad.isElegible()) {
            throw new BusinessException("La sede no está disponible para selección: " + elegibilidad.getMotivoResumen());
        }

        EstadoPractica estadoRegistrada = estadoPracticaRepository.findByCodigo("REGISTRADA")
                .orElseThrow(() -> new RuntimeException("Estado REGISTRADA no configurado en el sistema"));

        Practica practica = Practica.builder()
                .estudiante(estudiante)
                .sede(sede)
                .tipoPractica(tipoPractica)
                .estado(estadoRegistrada)
                .fechaInicio(LocalDate.now())
                .fechaFin(LocalDate.now().plusMonths(6))
                .activo(true)
                .build();

        return toDto(practicaRepository.save(practica));
    }

    @Override
    @Transactional
    public PracticaDTO create(PracticaDTO dto) {
        Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante", "id", dto.getIdEstudiante()));

        SedePractica sede = sedePracticaRepository.findById(dto.getIdSede())
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", dto.getIdSede()));

        EstadoPractica estado = estadoPracticaRepository.findById(dto.getIdEstado())
                .orElseThrow(() -> new ResourceNotFoundException("Estado", "id", dto.getIdEstado()));

        Practica practica = Practica.builder()
                .estudiante(estudiante)
                .sede(sede)
                .estado(estado)
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .horasTotales(dto.getHorasTotales())
                .horasRestantes(dto.getHorasRestantes())
                .areaPractica(dto.getAreaPractica())
                .descripcionPuesto(dto.getDescripcionPuesto())
                .remunerado(dto.getRemunerado() != null ? dto.getRemunerado() : false)
                .montoRemuneracion(dto.getMontoRemuneracion())
                .activo(true)
                .build();

        return toDto(practicaRepository.save(practica));
    }

    @Override
    @Transactional
    public PracticaDTO update(Long id, PracticaDTO dto) {
        Practica practica = practicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Práctica", "id", id));

        if (dto.getIdSede() != null) {
            SedePractica sede = sedePracticaRepository.findById(dto.getIdSede())
                    .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", dto.getIdSede()));
            practica.setSede(sede);
        }
        if (dto.getIdTutorExterno() != null) {
            practica.setTutorExterno(null); // FK constraint, set null temporarily
            // TODO: When TutorExterno entity integration is complete, resolve by ID
        }
        if (dto.getIdEstado() != null) {
            EstadoPractica estado = estadoPracticaRepository.findById(dto.getIdEstado())
                    .orElseThrow(() -> new ResourceNotFoundException("Estado", "id", dto.getIdEstado()));
            practica.setEstado(estado);
        }
        if (dto.getFechaInicio() != null) practica.setFechaInicio(dto.getFechaInicio());
        if (dto.getFechaFin() != null) practica.setFechaFin(dto.getFechaFin());
        if (dto.getHorasTotales() != null) practica.setHorasTotales(dto.getHorasTotales());
        if (dto.getHorasRestantes() != null) practica.setHorasRestantes(dto.getHorasRestantes());
        if (dto.getAreaPractica() != null) practica.setAreaPractica(dto.getAreaPractica());
        if (dto.getDescripcionPuesto() != null) practica.setDescripcionPuesto(dto.getDescripcionPuesto());
        if (dto.getRemunerado() != null) practica.setRemunerado(dto.getRemunerado());
        if (dto.getMontoRemuneracion() != null) practica.setMontoRemuneracion(dto.getMontoRemuneracion());

        return toDto(practicaRepository.save(practica));
    }

    @Override
    @Transactional(readOnly = true)
    public PracticaDTO findById(Long id) {
        return practicaRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Práctica", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PracticaDTO> findByEstudianteId(Long estudianteId) {
        return practicaRepository.findByEstudianteId(estudianteId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PracticaDTO> findBySedeId(Long sedeId) {
        return practicaRepository.findBySedeIdAndActivoTrue(sedeId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PracticaDTO> findAll() {
        return practicaRepository.findByActivoTrue().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        Practica practica = practicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Práctica", "id", id));
        if (!Boolean.TRUE.equals(practica.getActivo())) {
            throw new BusinessException("La práctica ya se encuentra desactivada");
        }
        practica.setActivo(false);
        practicaRepository.save(practica);
    }

    private PracticaDTO toDto(Practica entity) {
        PracticaDTO.PracticaDTOBuilder builder = PracticaDTO.builder()
                .id(entity.getId())
                .idEstudiante(entity.getEstudiante().getId())
                .nombreEstudiante(entity.getEstudiante().getUsuario().getNombres()
                        + " " + entity.getEstudiante().getUsuario().getApellidoPaterno())
                .idSede(entity.getSede().getId())
                .nombreSede(entity.getSede().getNombreSede())
                .razonSocialEmpresa(entity.getSede().getEmpresa().getRazonSocial())
                .idEstado(entity.getEstado().getId())
                .codigoEstado(entity.getEstado().getCodigo())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .horasTotales(entity.getHorasTotales())
                .horasRestantes(entity.getHorasRestantes())
                .areaPractica(entity.getAreaPractica())
                .descripcionPuesto(entity.getDescripcionPuesto())
                .remunerado(entity.getRemunerado())
                .montoRemuneracion(entity.getMontoRemuneracion())
                .activo(entity.getActivo());

        if (entity.getTipoPractica() != null) {
            builder.idTipoPractica(entity.getTipoPractica().getId())
                    .codigoTipoPractica(entity.getTipoPractica().getCodigo())
                    .nombreTipoPractica(entity.getTipoPractica().getNombre());
        }

        return builder.build();
    }
}
