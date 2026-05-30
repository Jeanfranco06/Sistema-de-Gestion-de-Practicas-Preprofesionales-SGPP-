package edu.unt.ingenieria_industrial.sgpp.usuarios.service.impl;

import edu.unt.ingenieria_industrial.sgpp.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.RolSistema;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.UsuarioCreateDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.UsuarioDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.Rol;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.UsuarioRol;
import edu.unt.ingenieria_industrial.sgpp.usuarios.repository.RolRepository;
import edu.unt.ingenieria_industrial.sgpp.usuarios.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.usuarios.repository.UsuarioRolRepository;
import edu.unt.ingenieria_industrial.sgpp.usuarios.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioRolRepository usuarioRolRepository;
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
        usuario.setActivo(dto.getActivo());
        
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
        
        // Eliminar roles actuales
        usuario.getUsuarioRoles().clear();
        usuarioRepository.save(usuario);
        
        // Asignar nuevos roles
        assignRolesToUsuario(usuario, roles);
    }

    private void assignRolesToUsuario(Usuario usuario, Set<String> roles) {
        for (String rolNombre : roles) {
            Rol rol = rolRepository.findByNombre(RolSistema.valueOf(rolNombre))
                    .orElseThrow(() -> new BusinessException("Rol no encontrado: " + rolNombre));
            
            UsuarioRol usuarioRol = UsuarioRol.builder()
                    .usuario(usuario)
                    .rol(rol)
                    .asignadoPor("SYSTEM")
                    .build();
            
            usuario.getUsuarioRoles().add(usuarioRol);
        }
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
                .activo(entity.getActivo())
                .cuentaBloqueada(entity.getCuentaBloqueada())
                .roles(entity.getUsuarioRoles().stream()
                        .map(ur -> ur.getRol().getNombre().name())
                        .collect(Collectors.toList()))
                .build();
    }
}
