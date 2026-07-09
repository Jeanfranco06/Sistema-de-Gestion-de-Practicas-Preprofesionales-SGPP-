package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.*;

import java.util.List;

public interface UsuarioService {
    UsuarioDTO create(UsuarioCreateDTO dto);
    UsuarioDTO update(Long id, UsuarioDTO dto);
    UsuarioDTO findById(Long id);
    UsuarioDetalleResponse findDetalleById(Long id);
    List<UsuarioDTO> findAll();
    List<UsuarioDTO> findAllWithFilters(String nombre, String correo, String estado, String rol, String tipoUsuario);
    void disable(Long id);
    void unlock(Long id);
    void updateEstado(Long id, EstadoUsuarioRequest request);
    void assignRoles(Long id, java.util.Set<String> roles);
    List<RolDTO> getRolesByUsuarioId(Long id);
    void revokeRol(Long usuarioId, Long rolId);
    boolean checkFieldAvailable(String field, String value, Long excludeId);
    EstudianteDTO actualizarPerfilAcademico(String username, EstudianteUpdateDTO dto);
    EstudianteDTO obtenerPerfilAcademico(String username);
}

