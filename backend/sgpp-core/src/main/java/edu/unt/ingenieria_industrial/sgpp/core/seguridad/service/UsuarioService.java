package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.UsuarioCreateDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.UsuarioDTO;

import java.util.List;

public interface UsuarioService {
    UsuarioDTO create(UsuarioCreateDTO dto);
    UsuarioDTO update(Long id, UsuarioDTO dto);
    UsuarioDTO findById(Long id);
    List<UsuarioDTO> findAll();
    void disable(Long id);
    void unlock(Long id);
    void assignRoles(Long id, java.util.Set<String> roles);
}

