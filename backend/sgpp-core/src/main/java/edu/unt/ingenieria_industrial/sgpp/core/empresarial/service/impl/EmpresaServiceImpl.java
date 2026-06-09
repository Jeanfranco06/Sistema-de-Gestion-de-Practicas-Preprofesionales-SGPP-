package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.EmpresaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.EmpresaService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmpresaServiceImpl implements EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaServiceImpl(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @Override
    @Transactional
    public EmpresaDTO create(EmpresaDTO dto) {
        if (dto.getRuc() == null || dto.getRuc().isBlank()) {
            throw new BusinessException("El RUC es obligatorio");
        }
        if (dto.getRazonSocial() == null || dto.getRazonSocial().isBlank()) {
            throw new BusinessException("La razón social es obligatoria");
        }
        if (empresaRepository.existsByRuc(dto.getRuc())) {
            throw new BusinessException("Ya existe una empresa registrada con el RUC " + dto.getRuc());
        }
        Empresa empresa = toEntity(dto);
        empresa.setActivo(true);
        empresa.setValidado(false);
        return toDto(empresaRepository.save(empresa));
    }

    @Override
    @Transactional
    public EmpresaDTO update(Long id, EmpresaDTO dto) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", id));

        if (dto.getRuc() != null && !dto.getRuc().equals(empresa.getRuc())) {
            if (empresaRepository.existsByRuc(dto.getRuc())) {
                throw new BusinessException("Ya existe otra empresa con el RUC " + dto.getRuc());
            }
            empresa.setRuc(dto.getRuc());
        }
        empresa.setRazonSocial(dto.getRazonSocial());
        empresa.setNombreComercial(dto.getNombreComercial());
        empresa.setDireccion(dto.getDireccion());
        empresa.setDistrito(dto.getDistrito());
        empresa.setProvincia(dto.getProvincia());
        empresa.setDepartamento(dto.getDepartamento());
        empresa.setPais(dto.getPais());
        empresa.setTelefono(dto.getTelefono());
        empresa.setEmail(dto.getEmail());
        empresa.setPaginaWeb(dto.getPaginaWeb());
        empresa.setSectorEconomico(dto.getSectorEconomico());
        empresa.setTamanoEmpresa(dto.getTamanoEmpresa());
        return toDto(empresaRepository.save(empresa));
    }

    @Override
    @Transactional(readOnly = true)
    public EmpresaDTO findById(Long id) {
        return empresaRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaDTO> findAll() {
        return empresaRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", id));
        if (!Boolean.TRUE.equals(empresa.getActivo())) {
            throw new BusinessException("La empresa ya se encuentra desactivada");
        }
        empresa.setActivo(false);
        empresaRepository.save(empresa);
    }

    @Override
    @Transactional
    public void validate(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", id));
        if (Boolean.TRUE.equals(empresa.getValidado())) {
            throw new BusinessException("La empresa ya se encuentra validada");
        }
        empresa.setValidado(true);
        empresaRepository.save(empresa);
    }

    private Empresa toEntity(EmpresaDTO dto) {
        return Empresa.builder()
                .ruc(dto.getRuc())
                .razonSocial(dto.getRazonSocial())
                .nombreComercial(dto.getNombreComercial())
                .direccion(dto.getDireccion())
                .distrito(dto.getDistrito())
                .provincia(dto.getProvincia())
                .departamento(dto.getDepartamento())
                .pais(dto.getPais())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .paginaWeb(dto.getPaginaWeb())
                .sectorEconomico(dto.getSectorEconomico())
                .tamanoEmpresa(dto.getTamanoEmpresa())
                .build();
    }

    private EmpresaDTO toDto(Empresa entity) {
        return EmpresaDTO.builder()
                .id(entity.getId())
                .ruc(entity.getRuc())
                .razonSocial(entity.getRazonSocial())
                .nombreComercial(entity.getNombreComercial())
                .direccion(entity.getDireccion())
                .distrito(entity.getDistrito())
                .provincia(entity.getProvincia())
                .departamento(entity.getDepartamento())
                .pais(entity.getPais())
                .telefono(entity.getTelefono())
                .email(entity.getEmail())
                .paginaWeb(entity.getPaginaWeb())
                .sectorEconomico(entity.getSectorEconomico())
                .tamanoEmpresa(entity.getTamanoEmpresa())
                .activo(entity.getActivo())
                .validado(entity.getValidado())
                .build();
    }
}
