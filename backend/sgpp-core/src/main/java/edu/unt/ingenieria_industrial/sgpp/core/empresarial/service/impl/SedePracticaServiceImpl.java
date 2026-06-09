package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedeCatalogoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedePracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.ValidacionSede;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ConvenioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ValidacionSedeRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.SedeElegibilidadService;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.SedePracticaService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.PracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.TutorExternoRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SedePracticaServiceImpl implements SedePracticaService {

    private final SedePracticaRepository sedePracticaRepository;
    private final EmpresaRepository empresaRepository;
    private final ConvenioRepository convenioRepository;
    private final ValidacionSedeRepository validacionSedeRepository;
    private final TutorExternoRepository tutorExternoRepository;
    private final PracticaRepository practicaRepository;
    private final SedeElegibilidadService sedeElegibilidadService;

    public SedePracticaServiceImpl(SedePracticaRepository sedePracticaRepository,
                                    EmpresaRepository empresaRepository,
                                    ConvenioRepository convenioRepository,
                                    ValidacionSedeRepository validacionSedeRepository,
                                    TutorExternoRepository tutorExternoRepository,
                                    PracticaRepository practicaRepository,
                                    SedeElegibilidadService sedeElegibilidadService) {
        this.sedePracticaRepository = sedePracticaRepository;
        this.empresaRepository = empresaRepository;
        this.convenioRepository = convenioRepository;
        this.validacionSedeRepository = validacionSedeRepository;
        this.tutorExternoRepository = tutorExternoRepository;
        this.practicaRepository = practicaRepository;
        this.sedeElegibilidadService = sedeElegibilidadService;
    }

    @Override
    @Transactional
    public SedePracticaDTO create(SedePracticaDTO dto) {
        if (dto.getEmpresaId() == null) {
            throw new BusinessException("La empresa es obligatoria");
        }
        if (dto.getNombreSede() == null || dto.getNombreSede().isBlank()) {
            throw new BusinessException("El nombre de la sede es obligatorio");
        }
        if (dto.getDireccion() == null || dto.getDireccion().isBlank()) {
            throw new BusinessException("La dirección de la sede es obligatoria");
        }
        Empresa empresa = empresaRepository.findById(dto.getEmpresaId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", dto.getEmpresaId()));

        SedePractica sede = toEntity(dto);
        sede.setEmpresa(empresa);
        sede.setActivo(true);
        sede.setEstadoSede("ACTIVA");
        return toDto(sedePracticaRepository.save(sede));
    }

    @Override
    @Transactional
    public SedePracticaDTO update(Long id, SedePracticaDTO dto) {
        SedePractica sede = sedePracticaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", id));

        sede.setNombreSede(dto.getNombreSede());
        sede.setDireccion(dto.getDireccion());
        sede.setDistrito(dto.getDistrito());
        sede.setProvincia(dto.getProvincia());
        sede.setDepartamento(dto.getDepartamento());
        sede.setTelefono(dto.getTelefono());
        sede.setEmail(dto.getEmail());
        sede.setNombreContacto(dto.getNombreContacto());
        sede.setCargoContacto(dto.getCargoContacto());
        sede.setTelefonoContacto(dto.getTelefonoContacto());
        sede.setEmailContacto(dto.getEmailContacto());
        sede.setCapacidadMaxima(dto.getCapacidadMaxima());

        sede.setTipoEntidad(dto.getTipoEntidad());
        sede.setAreaUnidad(dto.getAreaUnidad());
        sede.setDescripcionGeneral(dto.getDescripcionGeneral());
        sede.setActividadesPrincipales(dto.getActividadesPrincipales());
        sede.setRiesgosRelevantes(dto.getRiesgosRelevantes());
        sede.setNombreTutorEmpresa(dto.getNombreTutorEmpresa());
        sede.setCargoTutorEmpresa(dto.getCargoTutorEmpresa());
        sede.setCorreoTutorEmpresa(dto.getCorreoTutorEmpresa());
        sede.setTelefonoTutorEmpresa(dto.getTelefonoTutorEmpresa());
        if (dto.getEstadoSede() != null) {
            sede.setEstadoSede(dto.getEstadoSede());
        }
        return toDto(sedePracticaRepository.save(sede));
    }

    @Override
    @Transactional(readOnly = true)
    public SedePracticaDTO findById(Long id) {
        return sedePracticaRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findAllActive() {
        return sedePracticaRepository.findByActivoTrue().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByEmpresaId(Long empresaId) {
        return sedePracticaRepository.findByEmpresaIdAndActivoTrue(empresaId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        SedePractica sede = sedePracticaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", id));
        if (!Boolean.TRUE.equals(sede.getActivo())) {
            throw new BusinessException("La sede ya se encuentra desactivada");
        }
        long practicasActivas = practicaRepository.findBySedeIdAndActivoTrue(id).size();
        if (practicasActivas > 0) {
            throw new BusinessException(
                    "No se puede desactivar la sede porque tiene " + practicasActivas +
                    " prácticas activas asociadas. Finalícelas antes de desactivar la sede.");
        }
        sede.setActivo(false);
        sedePracticaRepository.save(sede);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findWithValidConvenios() {
        return sedePracticaRepository.findWithValidConvenios().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cambiarEstado(Long id, String estado) {
        if (estado == null || estado.isBlank()) {
            throw new BusinessException("El estado es obligatorio");
        }
        SedePractica sede = sedePracticaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", id));
        sede.setEstadoSede(estado);
        sedePracticaRepository.save(sede);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByEstadoSede(String estadoSede) {
        return sedePracticaRepository.findByEstadoSede(estadoSede).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByEmpresaIdAndEstadoSede(Long empresaId, String estadoSede) {
        return sedePracticaRepository.findByEmpresaIdAndEstadoSede(empresaId, estadoSede).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByDistrito(String distrito) {
        return sedePracticaRepository.findByDistritoContainingIgnoreCase(distrito).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByProvincia(String provincia) {
        return sedePracticaRepository.findByProvinciaContainingIgnoreCase(provincia).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByDepartamento(String departamento) {
        return sedePracticaRepository.findByDepartamentoContainingIgnoreCase(departamento).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByCapacidadMinima(Integer capacidadMinima) {
        return sedePracticaRepository.findByCapacidadMaximaGreaterThanEqual(capacidadMinima).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findAvailableForStudents() {
        return sedePracticaRepository.findAvailableForStudents().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    private SedePractica toEntity(SedePracticaDTO dto) {
        return SedePractica.builder()
                .nombreSede(dto.getNombreSede())
                .direccion(dto.getDireccion())
                .distrito(dto.getDistrito())
                .provincia(dto.getProvincia())
                .departamento(dto.getDepartamento())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .nombreContacto(dto.getNombreContacto())
                .cargoContacto(dto.getCargoContacto())
                .telefonoContacto(dto.getTelefonoContacto())
                .emailContacto(dto.getEmailContacto())
                .capacidadMaxima(dto.getCapacidadMaxima())
                .tipoEntidad(dto.getTipoEntidad())
                .areaUnidad(dto.getAreaUnidad())
                .descripcionGeneral(dto.getDescripcionGeneral())
                .actividadesPrincipales(dto.getActividadesPrincipales())
                .riesgosRelevantes(dto.getRiesgosRelevantes())
                .nombreTutorEmpresa(dto.getNombreTutorEmpresa())
                .cargoTutorEmpresa(dto.getCargoTutorEmpresa())
                .correoTutorEmpresa(dto.getCorreoTutorEmpresa())
                .telefonoTutorEmpresa(dto.getTelefonoTutorEmpresa())
                .estadoSede(dto.getEstadoSede() != null ? dto.getEstadoSede() : "ACTIVA")
                .build();
    }

    private SedePracticaDTO toDto(SedePractica entity) {
        return SedePracticaDTO.builder()
                .id(entity.getId())
                .empresaId(entity.getEmpresa().getId())
                .razonSocialEmpresa(entity.getEmpresa().getRazonSocial())
                .nombreSede(entity.getNombreSede())
                .direccion(entity.getDireccion())
                .distrito(entity.getDistrito())
                .provincia(entity.getProvincia())
                .departamento(entity.getDepartamento())
                .telefono(entity.getTelefono())
                .email(entity.getEmail())
                .nombreContacto(entity.getNombreContacto())
                .cargoContacto(entity.getCargoContacto())
                .telefonoContacto(entity.getTelefonoContacto())
                .emailContacto(entity.getEmailContacto())
                .capacidadMaxima(entity.getCapacidadMaxima())
                .activo(entity.getActivo())
                .tipoEntidad(entity.getTipoEntidad())
                .areaUnidad(entity.getAreaUnidad())
                .descripcionGeneral(entity.getDescripcionGeneral())
                .actividadesPrincipales(entity.getActividadesPrincipales())
                .riesgosRelevantes(entity.getRiesgosRelevantes())
                .nombreTutorEmpresa(entity.getNombreTutorEmpresa())
                .cargoTutorEmpresa(entity.getCargoTutorEmpresa())
                .correoTutorEmpresa(entity.getCorreoTutorEmpresa())
                .telefonoTutorEmpresa(entity.getTelefonoTutorEmpresa())
                .estadoSede(entity.getEstadoSede())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedeCatalogoDTO> getCatalogoSedes() {
        List<SedePractica> sedes = sedePracticaRepository.findByActivoTrue();
        return sedes.stream().map(this::toCatalogoDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SedeCatalogoDTO getDetalleSede(Long id) {
        SedePractica sede = sedePracticaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede", "id", id));
        return toCatalogoDto(sede);
    }

    private SedeCatalogoDTO toCatalogoDto(SedePractica sede) {
        LocalDate hoy = LocalDate.now();

        List<Convenio> convenios = convenioRepository.findByEmpresaIdAndVigenteTrue(sede.getEmpresa().getId());
        boolean tieneConvenioVigente = convenios.stream().anyMatch(c ->
                Boolean.TRUE.equals(c.getActivo()) &&
                !c.getFechaInicio().isAfter(hoy) &&
                c.getFechaFin().isAfter(hoy));
        String estadoConvenio = tieneConvenioVigente ? "VIGENTE" : "NO_VIGENTE";
        LocalDate fechaVigenciaConvenio = convenios.stream()
                .filter(c -> Boolean.TRUE.equals(c.getActivo()))
                .findFirst().map(Convenio::getFechaFin).orElse(null);

        ValidacionSede validacion = validacionSedeRepository
                .findValidacionVigente(sede.getId(), hoy).orElse(null);
        Boolean tieneValidacionVigente = validacion != null;
        String resultadoValidacion = tieneValidacionVigente ? validacion.getResultadoValidacion() : "NO_VALIDADA";
        LocalDate fechaVigenciaValidacion = tieneValidacionVigente ? validacion.getFechaVigenciaHasta() : null;

        List<TutorExterno> tutores = tutorExternoRepository.findActiveBySedeId(sede.getId());
        Boolean tieneTutorActivo = !tutores.isEmpty();
        Integer cantidadTutoresActivos = tutores.size();
        List<SedeCatalogoDTO.TutorInfoDTO> tutoresActivos = new ArrayList<>();
        for (TutorExterno t : tutores) {
            if (t.getUsuario() != null) {
                SedeCatalogoDTO.TutorInfoDTO tutorInfo = SedeCatalogoDTO.TutorInfoDTO.builder()
                        .id(t.getId())
                        .nombres(t.getUsuario().getNombres() != null ? t.getUsuario().getNombres() : "")
                        .apellidoPaterno(t.getUsuario().getApellidoPaterno() != null ? t.getUsuario().getApellidoPaterno() : "")
                        .apellidoMaterno(t.getUsuario().getApellidoMaterno() != null ? t.getUsuario().getApellidoMaterno() : "")
                        .cargo(t.getCargo() != null ? t.getCargo() : "")
                        .correo(t.getUsuario().getEmail() != null ? t.getUsuario().getEmail() : "")
                        .telefono(t.getUsuario().getTelefono() != null ? t.getUsuario().getTelefono() : "")
                        .build();
                tutoresActivos.add(tutorInfo);
            }
        }

        long practicasActivas = practicaRepository.findBySedeIdAndActivoTrue(sede.getId()).size();
        Integer vacantesDisponibles = sede.getCapacidadMaxima() != null
                ? Math.max(0, sede.getCapacidadMaxima() - (int) practicasActivas)
                : 0;

        SedeElegibilidadService.ResultadoElegibilidad elegibilidad =
                sedeElegibilidadService.evaluarElegibilidad(sede);

        return SedeCatalogoDTO.builder()
                .id(sede.getId())
                .empresaId(sede.getEmpresa().getId())
                .razonSocialEmpresa(sede.getEmpresa().getRazonSocial())
                .nombreSede(sede.getNombreSede())
                .tipoEntidad(sede.getTipoEntidad())
                .direccion(sede.getDireccion())
                .departamento(sede.getDepartamento())
                .provincia(sede.getProvincia())
                .distrito(sede.getDistrito())
                .areaDisponible(sede.getAreaUnidad())
                .descripcion(sede.getDescripcionGeneral())
                .estadoSede(sede.getEstadoSede())
                .capacidadMaxima(sede.getCapacidadMaxima())
                .vacantesDisponibles(vacantesDisponibles)
                .activo(sede.getActivo())
                .telefono(sede.getTelefono())
                .email(sede.getEmail())
                .nombreContacto(sede.getNombreContacto())
                .cargoContacto(sede.getCargoContacto())
                .telefonoContacto(sede.getTelefonoContacto())
                .emailContacto(sede.getEmailContacto())
                .actividadesPrincipales(sede.getActividadesPrincipales())
                .riesgosRelevantes(sede.getRiesgosRelevantes())
                .nombreTutorEmpresa(sede.getNombreTutorEmpresa())
                .cargoTutorEmpresa(sede.getCargoTutorEmpresa())
                .correoTutorEmpresa(sede.getCorreoTutorEmpresa())
                .telefonoTutorEmpresa(sede.getTelefonoTutorEmpresa())
                .tieneConvenioVigente(tieneConvenioVigente)
                .estadoConvenio(estadoConvenio)
                .fechaVigenciaConvenio(fechaVigenciaConvenio)
                .tieneValidacionVigente(tieneValidacionVigente)
                .resultadoValidacion(resultadoValidacion)
                .fechaVigenciaValidacion(fechaVigenciaValidacion)
                .tieneTutorActivo(tieneTutorActivo)
                .cantidadTutoresActivos(cantidadTutoresActivos)
                .tutoresActivos(tutoresActivos)
                .esElegible(elegibilidad.isElegible())
                .motivoNoElegible(elegibilidad.getMotivoResumen())
                .build();
    }
}
