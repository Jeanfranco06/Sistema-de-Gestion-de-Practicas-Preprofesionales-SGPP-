package edu.unt.ingenieria_industrial.sgpp.core.practicas.service;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.RequisitoAcademicoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.RequisitoAcademico;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.RequisitoAcademicoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RequisitoAcademicoService {

    private final RequisitoAcademicoRepository requisitoAcademicoRepository;
    private final TipoPracticaRepository tipoPracticaRepository;

    @Transactional(readOnly = true)
    public List<RequisitoAcademicoDTO> listarTodos() {
        return requisitoAcademicoRepository.findByActivoTrueOrderByTipoPracticaNombreAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RequisitoAcademicoDTO> listarPorTipoPractica(String codigoTipoPractica) {
        return requisitoAcademicoRepository.findByTipoPracticaCodigoAndActivoTrue(codigoTipoPractica).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RequisitoAcademicoDTO obtenerPorId(Long id) {
        return requisitoAcademicoRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Requisito académico no encontrado con id: " + id));
    }

    public RequisitoAcademicoDTO crear(RequisitoAcademicoDTO dto) {
        RequisitoAcademico entity = new RequisitoAcademico();
        entity.setActivo(true);
        toEntity(dto, entity);
        return toDTO(requisitoAcademicoRepository.save(entity));
    }

    public RequisitoAcademicoDTO actualizar(Long id, RequisitoAcademicoDTO dto) {
        RequisitoAcademico entity = requisitoAcademicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requisito académico no encontrado con id: " + id));
        toEntity(dto, entity);
        return toDTO(requisitoAcademicoRepository.save(entity));
    }

    public void eliminar(Long id) {
        RequisitoAcademico entity = requisitoAcademicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requisito académico no encontrado con id: " + id));
        entity.setActivo(false);
        requisitoAcademicoRepository.save(entity);
    }

    private RequisitoAcademicoDTO toDTO(RequisitoAcademico r) {
        TipoPractica tipo = r.getTipoPractica();
        return RequisitoAcademicoDTO.builder()
                .id(r.getId())
                .idTipoPractica(tipo != null ? tipo.getId() : null)
                .codigoTipoPractica(tipo != null ? tipo.getCodigo() : null)
                .nombreTipoPractica(tipo != null ? tipo.getNombre() : null)
                .nombre(r.getNombre())
                .descripcion(r.getDescripcion())
                .obligatorio(r.getObligatorio())
                .activo(r.getActivo())
                .build();
    }

    private void toEntity(RequisitoAcademicoDTO dto, RequisitoAcademico entity) {
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setObligatorio(dto.getObligatorio() != null ? dto.getObligatorio() : true);
        if (dto.getIdTipoPractica() != null) {
            TipoPractica tipo = tipoPracticaRepository.findById(dto.getIdTipoPractica())
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo de práctica no encontrado: " + dto.getIdTipoPractica()));
            entity.setTipoPractica(tipo);
        }
    }
}
