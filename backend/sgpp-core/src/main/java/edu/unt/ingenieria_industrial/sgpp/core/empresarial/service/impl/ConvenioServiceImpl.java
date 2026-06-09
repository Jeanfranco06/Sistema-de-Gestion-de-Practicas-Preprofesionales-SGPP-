package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.ConvenioDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ConvenioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.ConvenioService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConvenioServiceImpl implements ConvenioService {

    private final ConvenioRepository convenioRepository;
    private final EmpresaRepository empresaRepository;

    public ConvenioServiceImpl(ConvenioRepository convenioRepository, EmpresaRepository empresaRepository) {
        this.convenioRepository = convenioRepository;
        this.empresaRepository = empresaRepository;
    }

    @Override
    @Transactional
    public ConvenioDTO create(ConvenioDTO dto) {
        Empresa empresa = empresaRepository.findById(dto.getEmpresaId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", dto.getEmpresaId()));

        if (dto.getNumeroConvenio() == null || dto.getNumeroConvenio().isBlank()) {
            throw new BusinessException("El número de convenio es obligatorio");
        }
        if (convenioRepository.findByNumeroConvenio(dto.getNumeroConvenio()).isPresent()) {
            throw new BusinessException("Ya existe un convenio registrado con el número " + dto.getNumeroConvenio());
        }
        if (dto.getFechaInicio() == null) {
            throw new BusinessException("La fecha de inicio es obligatoria");
        }
        if (dto.getFechaFin() == null) {
            throw new BusinessException("La fecha de fin es obligatoria");
        }
        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new BusinessException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        if (dto.getFechaFin().isEqual(dto.getFechaInicio())) {
            throw new BusinessException("La fecha de fin debe ser posterior a la fecha de inicio");
        }

        Convenio convenio = toEntity(dto);
        convenio.setEmpresa(empresa);
        convenio.setActivo(true);
        convenio.setVigente(!dto.getFechaInicio().isAfter(LocalDate.now()) && dto.getFechaFin().isAfter(LocalDate.now()));
        return toDto(convenioRepository.save(convenio));
    }

    @Override
    @Transactional
    public ConvenioDTO update(Long id, ConvenioDTO dto) {
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convenio", "id", id));

        if (dto.getFechaInicio() != null && dto.getFechaFin() != null) {
            if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
                throw new BusinessException("La fecha de fin no puede ser anterior a la fecha de inicio");
            }
            if (dto.getFechaFin().isEqual(dto.getFechaInicio())) {
                throw new BusinessException("La fecha de fin debe ser posterior a la fecha de inicio");
            }
            convenio.setFechaInicio(dto.getFechaInicio());
            convenio.setFechaFin(dto.getFechaFin());
            LocalDate hoy = LocalDate.now();
            convenio.setVigente(!dto.getFechaInicio().isAfter(hoy) && dto.getFechaFin().isAfter(hoy));
        }
        if (dto.getObjetivo() != null) {
            convenio.setObjetivo(dto.getObjetivo());
        }
        return toDto(convenioRepository.save(convenio));
    }

    @Override
    @Transactional(readOnly = true)
    public ConvenioDTO findById(Long id) {
        return convenioRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Convenio", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConvenioDTO> findAllActive() {
        return convenioRepository.findByVigenteTrue().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConvenioDTO> findByEmpresaId(Long empresaId) {
        return convenioRepository.findByEmpresaIdAndVigenteTrue(empresaId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convenio", "id", id));
        if (!Boolean.TRUE.equals(convenio.getActivo())) {
            throw new BusinessException("El convenio ya se encuentra desactivado");
        }
        convenio.setActivo(false);
        convenio.setVigente(false);
        convenioRepository.save(convenio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConvenioDTO> findExpiringConvenios(int daysBeforeExpiration) {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(daysBeforeExpiration);
        return convenioRepository.findByVigenteTrueAndFechaFinBetween(start, end).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean validarVigencia(Long id) {
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convenio", "id", id));
        LocalDate hoy = LocalDate.now();
        boolean vigenteReal = Boolean.TRUE.equals(convenio.getActivo()) &&
                !convenio.getFechaInicio().isAfter(hoy) &&
                convenio.getFechaFin().isAfter(hoy);
        if (vigenteReal != Boolean.TRUE.equals(convenio.getVigente())) {
            convenio.setVigente(vigenteReal);
            convenioRepository.save(convenio);
        }
        return vigenteReal;
    }

    private Convenio toEntity(ConvenioDTO dto) {
        return Convenio.builder()
                .numeroConvenio(dto.getNumeroConvenio())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .objetivo(dto.getObjetivo())
                .build();
    }

    private ConvenioDTO toDto(Convenio entity) {
        return ConvenioDTO.builder()
                .id(entity.getId())
                .empresaId(entity.getEmpresa().getId())
                .razonSocialEmpresa(entity.getEmpresa().getRazonSocial())
                .numeroConvenio(entity.getNumeroConvenio())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .objetivo(entity.getObjetivo())
                .vigente(entity.getVigente())
                .activo(entity.getActivo())
                .build();
    }
}
