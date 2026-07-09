package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.EstadoAcademico;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.RolSistema;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumento;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoUsuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Docente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Rol;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.UsuarioRol;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.DocenteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.RolRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.TutorExternoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRolRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.sistema.service.ParametroSistemaService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final DocenteRepository docenteRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorExternoRepository tutorExternoRepository;
    private final EmpresaRepository empresaRepository;
    private final SedePracticaRepository sedePracticaRepository;
    private final ParametroSistemaService parametroSistemaService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UsuarioDTO create(UsuarioCreateDTO dto) {
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("El nombre de usuario ya existe");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("El email ya está registrado");
        }
        if (usuarioRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new BusinessException("El número de documento ya está registrado");
        }

        if (!dto.getEmail().toLowerCase().endsWith("@unitru.edu.pe")) {
            throw new BusinessException("El correo debe ser institucional (@unitru.edu.pe)");
        }

        if ("DNI".equals(dto.getTipoDocumento().name()) && !dto.getNumeroDocumento().matches("\\d{8}")) {
            throw new BusinessException("El DNI debe tener 8 dígitos numéricos");
        }

        Usuario usuario = Usuario.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .nombres(dto.getNombres())
                .apellidoPaterno(dto.getApellidoPaterno())
                .apellidoMaterno(dto.getApellidoMaterno())
                .numeroDocumento(dto.getNumeroDocumento())
                .tipoDocumento(dto.getTipoDocumento())
                .telefono(dto.getTelefono())
                .tipoUsuario(dto.getTipoUsuario() != null ? TipoUsuario.valueOf(dto.getTipoUsuario()) : null)
                .activo(true)
                .cuentaBloqueada(false)
                .intentosFallidos(0)
                .build();

        Usuario savedUsuario = usuarioRepository.save(usuario);

        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            assignRolesToUsuario(savedUsuario, dto.getRoles());
        }

        if (hasRole(dto.getRoles(), RolSistema.ESTUDIANTE)) {
            upsertEstudiante(savedUsuario, dto.getCodigoMatricula(), dto.getSemestre());
        }

        if (hasRole(dto.getRoles(), RolSistema.DOCENTE_ASESOR)) {
            upsertDocente(savedUsuario, dto);
        }

        if (hasRole(dto.getRoles(), RolSistema.TUTOR_EXTERNO)) {
            upsertTutorExterno(savedUsuario, dto);
        }

        return toDto(savedUsuario);
    }

    @Override
    @Transactional
    public UsuarioDTO update(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        if (dto.getEmail() != null && !dto.getEmail().equals(usuario.getEmail())) {
            if (!dto.getEmail().toLowerCase().endsWith("@unitru.edu.pe")) {
                throw new BusinessException("El correo debe ser institucional (@unitru.edu.pe)");
            }
            if (usuarioRepository.existsByEmail(dto.getEmail())) {
                throw new BusinessException("El email ya está registrado");
            }
            usuario.setEmail(dto.getEmail());
        }

        usuario.setNombres(dto.getNombres());
        usuario.setApellidoPaterno(dto.getApellidoPaterno());
        usuario.setApellidoMaterno(dto.getApellidoMaterno());
        usuario.setTelefono(dto.getTelefono());
        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }
        if (dto.getNumeroDocumento() != null && !dto.getNumeroDocumento().equals(usuario.getNumeroDocumento())) {
            if (usuarioRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
                throw new BusinessException("El número de documento ya está registrado");
            }
            usuario.setNumeroDocumento(dto.getNumeroDocumento());
        }
        if (dto.getTipoDocumento() != null) {
            usuario.setTipoDocumento(TipoDocumento.valueOf(dto.getTipoDocumento()));
        }
        if (dto.getTipoUsuario() != null) {
            usuario.setTipoUsuario(TipoUsuario.valueOf(dto.getTipoUsuario()));
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        List<String> currentRoles = usuario.getUsuarioRoles().stream()
                .map(ur -> ur.getRol().getNombre().name())
                .collect(Collectors.toList());

        if (currentRoles.contains(RolSistema.ESTUDIANTE.name()) || hasStudentData(dto.getCodigoMatricula(), dto.getSemestre())) {
            upsertEstudiante(usuario, dto.getCodigoMatricula(), dto.getSemestre());
        }

        if (currentRoles.contains(RolSistema.DOCENTE_ASESOR.name()) || hasDocenteData(dto)) {
            upsertDocente(usuario, dto);
        }

        if (currentRoles.contains(RolSistema.TUTOR_EXTERNO.name()) || hasTutorExternoData(dto)) {
            upsertTutorExterno(usuario, dto);
        }

        return toDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO findById(Long id) {
        return usuarioRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> findAll() {
        return usuarioRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void unlock(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        usuario.setCuentaBloqueada(false);
        usuario.setIntentosFallidos(0);
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void assignRoles(Long id, Set<String> roles) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        usuario.getUsuarioRoles().clear();
        usuarioRepository.saveAndFlush(usuario);

        assignRolesToUsuario(usuario, roles);
    }

    private void assignRolesToUsuario(Usuario usuario, Set<String> roles) {
        String asignadoPor = obtenerUsuarioAutenticado();
        for (String rolNombre : roles) {
            Rol rol = rolRepository.findByNombre(RolSistema.valueOf(rolNombre))
                    .orElseThrow(() -> new BusinessException("Rol no encontrado: " + rolNombre));

            UsuarioRol usuarioRol = UsuarioRol.builder()
                    .usuario(usuario)
                    .rol(rol)
                    .asignadoPor(asignadoPor)
                    .build();

            usuario.getUsuarioRoles().add(usuarioRol);
        }
        usuarioRepository.save(usuario);
    }

    private boolean hasRole(Set<String> roles, RolSistema role) {
        return roles != null && roles.stream().anyMatch(r -> role.name().equals(normalizeRoleName(r)));
    }

    private boolean hasRole(List<String> roles, RolSistema role) {
        return roles != null && roles.stream().anyMatch(r -> role.name().equals(normalizeRoleName(r)));
    }

    private String normalizeRoleName(String role) {
        if (role == null) {
            return "";
        }
        return role.trim().toUpperCase().replaceFirst("^ROLE_", "");
    }

    private boolean hasStudentData(String codigoMatricula, String semestre) {
        return hasText(codigoMatricula) || hasText(semestre);
    }

    private boolean hasDocenteData(UsuarioDTO dto) {
        return hasText(dto.getCodigoDocente()) || hasText(dto.getCategoria())
                || hasText(dto.getEspecialidad()) || hasText(dto.getDepartamento());
    }

    private boolean hasTutorExternoData(UsuarioDTO dto) {
        return hasText(dto.getEmpresaNombre()) || hasText(dto.getCargo()) || hasText(dto.getArea());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private void upsertEstudiante(Usuario usuario, String codigoMatricula, String semestre) {
        Estudiante estudiante = estudianteRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> Estudiante.builder()
                        .usuario(usuario)
                        .creditosAprobados(0)
                        .creditosRequeridosPractica(
                                parametroSistemaService.getValorIntegerByClave("CREDITOS_REQUERIDOS_PRACTICA", 140))
                        .fechaIngreso(LocalDate.now())
                        .estadoAcademico(EstadoAcademico.ACTIVO)
                        .build());

        if (hasText(codigoMatricula)) {
            String codigoNormalizado = codigoMatricula.trim();
            if (!codigoNormalizado.matches("\\d{6,20}")) {
                throw new BusinessException("El código de matrícula debe tener entre 6 y 20 dígitos numéricos");
            }
            estudianteRepository.findByCodigoEstudiantil(codigoNormalizado)
                    .filter(existing -> !existing.getUsuario().getId().equals(usuario.getId()))
                    .ifPresent(existing -> {
                        throw new BusinessException("El código de matrícula ya está registrado");
                    });
            estudiante.setCodigoEstudiantil(codigoNormalizado);
            usuario.setCodigoInstitucional(codigoNormalizado);
        } else if (!hasText(estudiante.getCodigoEstudiantil())) {
            throw new BusinessException("El código de matrícula es obligatorio para estudiantes");
        }

        Integer semestreActual = parseSemestreActual(semestre);
        if (semestreActual != null) {
            estudiante.setSemestreActual(semestreActual);
        } else if (estudiante.getSemestreActual() == null) {
            throw new BusinessException("El ciclo o semestre actual es obligatorio para estudiantes");
        }

        estudianteRepository.save(estudiante);
        usuarioRepository.save(usuario);
    }

    private void upsertDocente(Usuario usuario, UsuarioCreateDTO dto) {
        Docente docente = docenteRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> Docente.builder()
                        .usuario(usuario)
                        .activo(true)
                        .maxPracticantes(parametroSistemaService.getValorIntegerByClave("MAX_PRACTICANTES_POR_DOCENTE", 10))
                        .build());

        if (hasText(dto.getCodigoDocente())) {
            String codigoNormalizado = dto.getCodigoDocente().trim();
            docenteRepository.findByCodigoDocente(codigoNormalizado)
                    .filter(existing -> !existing.getUsuario().getId().equals(usuario.getId()))
                    .ifPresent(existing -> {
                        throw new BusinessException("El código docente ya está registrado");
                    });
            docente.setCodigoDocente(codigoNormalizado);
        }

        if (hasText(dto.getCategoria())) {
            docente.setCategoria(dto.getCategoria().trim());
        }
        if (hasText(dto.getEspecialidad())) {
            docente.setEspecialidad(dto.getEspecialidad().trim());
        }
        if (hasText(dto.getDepartamento())) {
            docente.setDepartamento(dto.getDepartamento().trim());
        }

        docenteRepository.save(docente);
    }

    private void upsertDocente(Usuario usuario, UsuarioDTO dto) {
        Docente docente = docenteRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> Docente.builder()
                        .usuario(usuario)
                        .activo(true)
                        .maxPracticantes(parametroSistemaService.getValorIntegerByClave("MAX_PRACTICANTES_POR_DOCENTE", 10))
                        .build());

        if (hasText(dto.getCodigoDocente())) {
            String codigoNormalizado = dto.getCodigoDocente().trim();
            docenteRepository.findByCodigoDocente(codigoNormalizado)
                    .filter(existing -> !existing.getUsuario().getId().equals(usuario.getId()))
                    .ifPresent(existing -> {
                        throw new BusinessException("El código docente ya está registrado");
                    });
            docente.setCodigoDocente(codigoNormalizado);
        }

        if (hasText(dto.getCategoria())) {
            docente.setCategoria(dto.getCategoria().trim());
        }
        if (hasText(dto.getEspecialidad())) {
            docente.setEspecialidad(dto.getEspecialidad().trim());
        }
        if (hasText(dto.getDepartamento())) {
            docente.setDepartamento(dto.getDepartamento().trim());
        }

        docenteRepository.save(docente);
    }

    private void upsertTutorExterno(Usuario usuario, UsuarioCreateDTO dto) {
        TutorExterno tutor = tutorExternoRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> TutorExterno.builder()
                        .usuario(usuario)
                        .activo(true)
                        .estadoTutor("ACTIVO")
                        .build());

        if (dto.getIdEmpresa() != null) {
            Empresa empresa = empresaRepository.findById(dto.getIdEmpresa())
                    .orElseThrow(() -> new BusinessException("Empresa no encontrada con ID: " + dto.getIdEmpresa()));
            tutor.setEmpresa(empresa);
        }
        if (dto.getIdSede() != null) {
            SedePractica sede = sedePracticaRepository.findById(dto.getIdSede())
                    .orElseThrow(() -> new BusinessException("Sede no encontrada con ID: " + dto.getIdSede()));
            tutor.setSede(sede);
        }
        if (hasText(dto.getEmpresaNombre())) {
            tutor.setEmpresaNombre(dto.getEmpresaNombre().trim());
        }
        if (hasText(dto.getCargo())) {
            tutor.setCargo(dto.getCargo().trim());
        }
        if (hasText(dto.getArea())) {
            tutor.setArea(dto.getArea().trim());
        }

        tutorExternoRepository.save(tutor);
    }

    private void upsertTutorExterno(Usuario usuario, UsuarioDTO dto) {
        TutorExterno tutor = tutorExternoRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> TutorExterno.builder()
                        .usuario(usuario)
                        .activo(true)
                        .estadoTutor("ACTIVO")
                        .build());

        if (dto.getIdEmpresa() != null) {
            Empresa empresa = empresaRepository.findById(dto.getIdEmpresa())
                    .orElseThrow(() -> new BusinessException("Empresa no encontrada con ID: " + dto.getIdEmpresa()));
            tutor.setEmpresa(empresa);
        }
        if (dto.getIdSede() != null) {
            SedePractica sede = sedePracticaRepository.findById(dto.getIdSede())
                    .orElseThrow(() -> new BusinessException("Sede no encontrada con ID: " + dto.getIdSede()));
            tutor.setSede(sede);
        }
        if (hasText(dto.getEmpresaNombre())) {
            tutor.setEmpresaNombre(dto.getEmpresaNombre().trim());
        }
        if (hasText(dto.getCargo())) {
            tutor.setCargo(dto.getCargo().trim());
        }
        if (hasText(dto.getArea())) {
            tutor.setArea(dto.getArea().trim());
        }

        tutorExternoRepository.save(tutor);
    }

    private Integer parseSemestreActual(String semestre) {
        if (!hasText(semestre)) {
            return null;
        }
        String value = semestre.trim().toUpperCase();
        if (value.matches("\\d+")) {
            return Integer.valueOf(value);
        }
        if (value.endsWith("-I")) {
            return 1;
        }
        if (value.endsWith("-II")) {
            return 2;
        }
        throw new BusinessException("El ciclo o semestre actual debe ser un número. Ejemplo: 6");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkFieldAvailable(String field, String value, Long excludeId) {
        if (value == null || value.trim().isEmpty()) return true;

        String normalizedValue = value.trim();

        switch (field) {
            case "username":
                if (excludeId != null) {
                    return usuarioRepository.findByUsername(normalizedValue)
                            .map(u -> u.getId().equals(excludeId))
                            .orElse(true);
                }
                return !usuarioRepository.existsByUsername(normalizedValue);

            case "email":
                if (excludeId != null) {
                    return usuarioRepository.findByEmail(normalizedValue)
                            .map(u -> u.getId().equals(excludeId))
                            .orElse(true);
                }
                return !usuarioRepository.existsByEmail(normalizedValue);

            case "numeroDocumento":
                if (excludeId != null) {
                    return usuarioRepository.findByNumeroDocumento(normalizedValue)
                            .map(u -> u.getId().equals(excludeId))
                            .orElse(true);
                }
                return !usuarioRepository.existsByNumeroDocumento(normalizedValue);

            case "codigoMatricula":
                if (excludeId != null) {
                    return estudianteRepository.findByCodigoEstudiantil(normalizedValue)
                            .map(e -> e.getUsuario().getId().equals(excludeId))
                            .orElse(true);
                }
                return !estudianteRepository.existsByCodigoEstudiantil(normalizedValue);

            case "codigoDocente":
                if (excludeId != null) {
                    return docenteRepository.findByCodigoDocente(normalizedValue)
                            .map(d -> d.getUsuario().getId().equals(excludeId))
                            .orElse(true);
                }
                return !docenteRepository.existsByCodigoDocente(normalizedValue);

            default:
                return true;
        }
    }

    private String obtenerUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDetalleResponse findDetalleById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        Docente docente = docenteRepository.findByUsuarioId(id).orElse(null);
        Estudiante estudiante = estudianteRepository.findByUsuarioId(id).orElse(null);
        TutorExterno tutor = tutorExternoRepository.findByUsuarioId(id).orElse(null);

        return toDetalleDto(usuario, docente, estudiante, tutor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> findAllWithFilters(String nombre, String correo, String estado, String rol, String tipoUsuario) {
        List<Usuario> usuarios = usuarioRepository.findAll();

        return usuarios.stream()
                .filter(u -> {
                    if (nombre == null) return true;
                    String q = nombre.toLowerCase();
                    return (u.getNombres() != null && u.getNombres().toLowerCase().contains(q)) ||
                           (u.getApellidoPaterno() != null && u.getApellidoPaterno().toLowerCase().contains(q)) ||
                           (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                           (u.getNumeroDocumento() != null && u.getNumeroDocumento().contains(q));
                })
                .filter(u -> correo == null || u.getEmail().toLowerCase().contains(correo.toLowerCase()))
                .filter(u -> estado == null ||
                          (estado.equals("ACTIVO") && u.getActivo()) ||
                          (estado.equals("INACTIVO") && !u.getActivo()) ||
                          (estado.equals("BLOQUEADO") && u.getCuentaBloqueada()))
                .filter(u -> rol == null || u.getUsuarioRoles().stream()
                          .anyMatch(ur -> ur.getRol().getNombre().name().equals(rol)))
                .filter(u -> tipoUsuario == null ||
                          (u.getTipoUsuario() != null && u.getTipoUsuario().name().equals(tipoUsuario)))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateEstado(Long id, EstadoUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        switch (request.getEstado()) {
            case "ACTIVO":
                usuario.setActivo(true);
                usuario.setCuentaBloqueada(false);
                break;
            case "INACTIVO":
                usuario.setActivo(false);
                break;
            case "BLOQUEADO":
                usuario.setCuentaBloqueada(true);
                break;
        }

        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RolDTO> getRolesByUsuarioId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        return usuario.getUsuarioRoles().stream()
                .map(ur -> RolDTO.builder()
                        .id(ur.getRol().getId())
                        .nombre(ur.getRol().getNombre())
                        .descripcion(ur.getRol().getDescripcion())
                        .activo(ur.getRol().getActivo())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void revokeRol(Long usuarioId, Long rolId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        UsuarioRol usuarioRol = usuario.getUsuarioRoles().stream()
                .filter(ur -> ur.getRol().getId().equals(rolId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("El usuario no tiene este rol asignado"));

        usuario.getUsuarioRoles().remove(usuarioRol);
        usuarioRepository.save(usuario);
    }

    private UsuarioDTO toDto(Usuario entity) {
        Estudiante estudiante = estudianteRepository.findByUsuarioId(entity.getId()).orElse(null);
        Docente docente = docenteRepository.findByUsuarioId(entity.getId()).orElse(null);
        TutorExterno tutor = tutorExternoRepository.findByUsuarioId(entity.getId()).orElse(null);
        UsuarioDTO.UsuarioDTOBuilder builder = UsuarioDTO.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .nombres(entity.getNombres())
                .apellidoPaterno(entity.getApellidoPaterno())
                .apellidoMaterno(entity.getApellidoMaterno())
                .numeroDocumento(entity.getNumeroDocumento())
                .tipoDocumento(entity.getTipoDocumento().name())
                .telefono(entity.getTelefono())
                .tipoUsuario(entity.getTipoUsuario() != null ? entity.getTipoUsuario().name() : null)
                .activo(entity.getActivo())
                .cuentaBloqueada(entity.getCuentaBloqueada())
                .roles(entity.getUsuarioRoles().stream()
                        .map(ur -> ur.getRol().getNombre().name())
                        .collect(Collectors.toList()));

        if (estudiante != null) {
            builder.codigoMatricula(estudiante.getCodigoEstudiantil())
                    .semestre(estudiante.getSemestreActual() != null ? estudiante.getSemestreActual().toString() : null);
        }

        if (docente != null) {
            builder.codigoDocente(docente.getCodigoDocente())
                    .categoria(docente.getCategoria())
                    .especialidad(docente.getEspecialidad())
                    .departamento(docente.getDepartamento());
        }

        if (tutor != null) {
            builder.empresaNombre(tutor.getEmpresaNombre())
                    .cargo(tutor.getCargo())
                    .area(tutor.getArea());
        }

        return builder.build();
    }

    private UsuarioDetalleResponse toDetalleDto(Usuario usuario, Docente docente, Estudiante estudiante, TutorExterno tutor) {
        return UsuarioDetalleResponse.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .nombres(usuario.getNombres())
                .apellidoPaterno(usuario.getApellidoPaterno())
                .apellidoMaterno(usuario.getApellidoMaterno())
                .numeroDocumento(usuario.getNumeroDocumento())
                .tipoDocumento(usuario.getTipoDocumento())
                .telefono(usuario.getTelefono())
                .codigoInstitucional(usuario.getCodigoInstitucional())
                .tipoUsuario(usuario.getTipoUsuario())
                .activo(usuario.getActivo())
                .cuentaBloqueada(usuario.getCuentaBloqueada())
                .fechaUltimoAcceso(usuario.getFechaUltimoAcceso())
                .fechaRegistro(usuario.getFechaCreacion())
                .fechaActualizacion(usuario.getFechaActualizacion())
                .roles(usuario.getUsuarioRoles().stream()
                        .map(ur -> RolDTO.builder()
                                .id(ur.getRol().getId())
                                .nombre(ur.getRol().getNombre())
                                .descripcion(ur.getRol().getDescripcion())
                                .activo(ur.getRol().getActivo())
                                .build())
                        .collect(Collectors.toList()))
                .estudiante(estudiante != null ? EstudianteDTO.builder()
                        .id(estudiante.getId())
                        .codigoEstudiantil(estudiante.getCodigoEstudiantil())
                        .semestreActual(estudiante.getSemestreActual())
                        .estadoAcademico(estudiante.getEstadoAcademico())
                        .build() : null)
                .docente(docente != null ? DocenteDTO.builder()
                        .id(docente.getId())
                        .codigoDocente(docente.getCodigoDocente())
                        .categoria(docente.getCategoria())
                        .especialidad(docente.getEspecialidad())
                        .departamento(docente.getDepartamento())
                        .activo(docente.getActivo())
                        .maxPracticantes(docente.getMaxPracticantes())
                        .build() : null)
                .tutorExterno(tutor != null ? TutorExternoDTO.builder()
                        .id(tutor.getId())
                        .idUsuario(usuario.getId())
                        .empresaNombre(tutor.getEmpresaNombre())
                        .cargo(tutor.getCargo())
                        .area(tutor.getArea())
                        .activo(tutor.getActivo())
                        .estadoTutor(tutor.getEstadoTutor())
                        .build() : null)
                .build();
    }
}
