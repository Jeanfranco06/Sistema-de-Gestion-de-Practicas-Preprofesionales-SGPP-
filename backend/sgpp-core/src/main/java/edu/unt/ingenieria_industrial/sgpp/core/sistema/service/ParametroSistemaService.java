package edu.unt.ingenieria_industrial.sgpp.core.sistema.service;

import edu.unt.ingenieria_industrial.sgpp.core.sistema.repository.ParametroSistemaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.model.ParametroSistema;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ParametroSistemaService {

    private final ParametroSistemaRepository parametroSistemaRepository;

    public List<ParametroSistema> findAll() {
        return parametroSistemaRepository.findByActivoTrue();
    }

    public ParametroSistema findById(Long id) {
        return parametroSistemaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parámetro no encontrado con id: " + id));
    }

    public ParametroSistema findByClave(String clave) {
        return parametroSistemaRepository.findByClave(clave)
                .orElseThrow(() -> new ResourceNotFoundException("Parámetro no encontrado con clave: " + clave));
    }

    public String getValorByClave(String clave) {
        return findByClave(clave).getValor();
    }

    public Integer getValorIntegerByClave(String clave) {
        return Integer.parseInt(getValorByClave(clave));
    }

    public Integer getValorIntegerByClave(String clave, Integer defaultVal) {
        try {
            return Integer.parseInt(getValorByClave(clave));
        } catch (ResourceNotFoundException | NumberFormatException e) {
            return defaultVal;
        }
    }

    public ParametroSistema create(ParametroSistema parametro) {
        if (parametroSistemaRepository.existsByClave(parametro.getClave())) {
            throw new IllegalArgumentException("Ya existe un parámetro con la clave: " + parametro.getClave());
        }
        return parametroSistemaRepository.save(parametro);
    }

    public ParametroSistema update(Long id, ParametroSistema parametro) {
        ParametroSistema existing = findById(id);
        existing.setValor(parametro.getValor());
        existing.setDescripcion(parametro.getDescripcion());
        existing.setTipoDato(parametro.getTipoDato());
        existing.setActivo(parametro.getActivo());
        return parametroSistemaRepository.save(existing);
    }

    public void delete(Long id) {
        ParametroSistema parametro = findById(id);
        parametro.setActivo(false);
        parametroSistemaRepository.save(parametro);
    }

    public List<ParametroSistema> findByPrefijo(String prefijo) {
        return parametroSistemaRepository.findByActivoTrue().stream()
                .filter(p -> p.getClave().startsWith(prefijo))
                .toList();
    }
}
