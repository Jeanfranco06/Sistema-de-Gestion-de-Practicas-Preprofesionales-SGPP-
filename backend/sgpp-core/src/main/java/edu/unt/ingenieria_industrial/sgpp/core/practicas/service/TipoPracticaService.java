package edu.unt.ingenieria_industrial.sgpp.core.practicas.service;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.TipoPracticaDTO;

import java.util.List;

public interface TipoPracticaService {
    List<TipoPracticaDTO> findAllActive();
    TipoPracticaDTO findByCodigo(String codigo);
}
