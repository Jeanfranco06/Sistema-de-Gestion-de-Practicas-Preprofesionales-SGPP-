package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.RolSistema;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumento;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoUsuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Docente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Rol;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.UsuarioRol;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.DocenteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.RolRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRolRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UsuarioDTO create(UsuarioCreateDTO dto) {
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("El nombre de usuario ya existe");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("El email ya estÃ¡ registrado");
        }
        if (usuarioRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new BusinessException("El nÃºmero de documento ya estÃ¡ registrado");
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

        return toDto(savedUsuario);
    }

    @Override
    @Transactional
    public UsuarioDTO update(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        usuario.setNombres(dto.getNombres());
        usuario.setApellidoPaterno(dto.getApellidoPaterno());
        usuario.setApellidoMaterno(dto.getApellidoMaterno());
        usuario.setTelefono(dto.getTelefono());
        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }
        if (dto.getEmail() != null) {
            usuario.setEmail(dto.getEmail());
        }
        if (dto.getNumeroDocumento() != null) {
            usuario.setNumeroDocumento(dto.getNumeroDocumento());
        }
        if (dto.getTipoDocumento() != null) {
            usuario.setTipoDocumento(TipoDocumento.valueOf(dto.getTipoDocumento()));
        }
        if (dto.getTipoUsuario() != null) {
            usuario.setTipoUsuario(TipoUsuario.valueOf(dto.getTipoUsuario()));
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
        
        // Limpiar roles actuales y forzar flush para que DELETE ocurra antes de INSERT
        usuario.getUsuarioRoles().clear();
        usuarioRepository.saveAndFlush(usuario);
        
        // Asignar nuevos roles
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
        
        return toDetalleDto(usuario, docente, estudiante);
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
        
        usuario.setFechaActualizacion(LocalDateTime.now());
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
        return UsuarioDTO.builder()
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
                        .collect(Collectors.toList()))
                .build();
    }

    private UsuarioDetalleResponse toDetalleDto(Usuario usuario, Docente docente, Estudiante estudiante) {
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
                .fechaRegistro(usuario.getFechaRegistro())
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
                .tutorExterno(null)
                .build();
    }
}

