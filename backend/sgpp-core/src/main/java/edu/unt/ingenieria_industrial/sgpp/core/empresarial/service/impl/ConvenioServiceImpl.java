package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.ConvenioDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ConvenioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.ConvenioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConvenioServiceImpl implements ConvenioService {

    @Autowired
    private ConvenioRepository convenioRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Override
    @Transactional
    public ConvenioDTO create(ConvenioDTO dto) {
        Empresa empresa = empresaRepository.findById(dto.getEmpresaId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        if (convenioRepository.findByNumeroConvenio(dto.getNumeroConvenio()).isPresent()) {
            throw new RuntimeException("Ya existe un convenio con este nÃºmero");
        }

        Convenio convenio = toEntity(dto);
        convenio.setEmpresa(empresa);
        convenio.setActivo(true);
        convenio.setVigente(true);
        return toDto(convenioRepository.save(convenio));
    }

    @Override
    @Transactional
    public ConvenioDTO update(Long id, ConvenioDTO dto) {
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Convenio no encontrado"));

        convenio.setFechaInicio(dto.getFechaInicio());
        convenio.setFechaFin(dto.getFechaFin());
        convenio.setObjetivo(dto.getObjetivo());
        
        // Auto actualizar vigencia
        convenio.setVigente(dto.getFechaFin().isAfter(LocalDate.now()));

        return toDto(convenioRepository.save(convenio));
    }

    @Override
    @Transactional(readOnly = true)
    public ConvenioDTO findById(Long id) {
        return convenioRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Convenio no encontrado"));
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
                .orElseThrow(() -> new RuntimeException("Convenio no encontrado"));
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

