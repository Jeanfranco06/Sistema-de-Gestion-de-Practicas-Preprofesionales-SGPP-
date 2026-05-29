package edu.unt.ingenieria_industrial.sgpp.sedes.service.impl;

import edu.unt.ingenieria_industrial.sgpp.sedes.dto.SedePracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.sedes.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.sedes.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.sedes.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.sedes.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.sedes.service.SedePracticaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SedePracticaServiceImpl implements SedePracticaService {

    @Autowired
    private SedePracticaRepository sedePracticaRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Override
    @Transactional
    public SedePracticaDTO create(SedePracticaDTO dto) {
        Empresa empresa = empresaRepository.findById(dto.getEmpresaId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        SedePractica sede = toEntity(dto);
        sede.setEmpresa(empresa);
        sede.setActivo(true);
        return toDto(sedePracticaRepository.save(sede));
    }

    @Override
    @Transactional
    public SedePracticaDTO update(Long id, SedePracticaDTO dto) {
        SedePractica sede = sedePracticaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
        
        sede.setNombreSede(dto.getNombreSede());
        sede.setDireccion(dto.getDireccion());
        sede.setDistrito(dto.getDistrito());
        sede.setProvincia(dto.getProvincia());
        sede.setDepartamento(dto.getDepartamento());
        sede.setTelefono(dto.getTelefono());
        sede.setEmail(dto.getEmail());
        sede.setNombreContacto(dto.getNombreContacto());
        sede.setCargoContacto(dto.getCargoContacto());
        sede.setTelefonoContacto(dto.getTelefonoContacto());
        sede.setEmailContacto(dto.getEmailContacto());
        sede.setCapacidadMaxima(dto.getCapacidadMaxima());
        
        return toDto(sedePracticaRepository.save(sede));
    }

    @Override
    @Transactional(readOnly = true)
    public SedePracticaDTO findById(Long id) {
        return sedePracticaRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findAllActive() {
        return sedePracticaRepository.findByActivoTrue().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedePracticaDTO> findByEmpresaId(Long empresaId) {
        return sedePracticaRepository.findByEmpresaIdAndActivoTrue(empresaId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disable(Long id) {
        SedePractica sede = sedePracticaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
        sede.setActivo(false);
        sedePracticaRepository.save(sede);
    }

    private SedePractica toEntity(SedePracticaDTO dto) {
        return SedePractica.builder()
                .nombreSede(dto.getNombreSede())
                .direccion(dto.getDireccion())
                .distrito(dto.getDistrito())
                .provincia(dto.getProvincia())
                .departamento(dto.getDepartamento())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .nombreContacto(dto.getNombreContacto())
                .cargoContacto(dto.getCargoContacto())
                .telefonoContacto(dto.getTelefonoContacto())
                .emailContacto(dto.getEmailContacto())
                .capacidadMaxima(dto.getCapacidadMaxima())
                .build();
    }

    private SedePracticaDTO toDto(SedePractica entity) {
        return SedePracticaDTO.builder()
                .id(entity.getId())
                .empresaId(entity.getEmpresa().getId())
                .razonSocialEmpresa(entity.getEmpresa().getRazonSocial())
                .nombreSede(entity.getNombreSede())
                .direccion(entity.getDireccion())
                .distrito(entity.getDistrito())
                .provincia(entity.getProvincia())
                .departamento(entity.getDepartamento())
                .telefono(entity.getTelefono())
                .email(entity.getEmail())
                .nombreContacto(entity.getNombreContacto())
                .cargoContacto(entity.getCargoContacto())
                .telefonoContacto(entity.getTelefonoContacto())
                .emailContacto(entity.getEmailContacto())
                .capacidadMaxima(entity.getCapacidadMaxima())
                .activo(entity.getActivo())
                .build();
    }
}
