package edu.unt.ingenieria_industrial.sgpp.core.practicas.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.TipoPracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.TipoPracticaService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoPracticaServiceImpl implements TipoPracticaService {

    private final TipoPracticaRepository tipoPracticaRepository;

    public TipoPracticaServiceImpl(TipoPracticaRepository tipoPracticaRepository) {
        this.tipoPracticaRepository = tipoPracticaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoPracticaDTO> findAllActive() {
        return tipoPracticaRepository.findByActivoTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TipoPracticaDTO findByCodigo(String codigo) {
        return tipoPracticaRepository.findByCodigo(codigo)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("TipoPractica", "codigo", codigo));
    }

    private TipoPracticaDTO toDto(TipoPractica entity) {
        return TipoPracticaDTO.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .horasRequeridas(entity.getHorasRequeridas())
                .activo(entity.getActivo())
                .build();
    }
}
