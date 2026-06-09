package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.ConvenioDTO;
import java.util.List;

public interface ConvenioService {
    ConvenioDTO create(ConvenioDTO dto);
    ConvenioDTO update(Long id, ConvenioDTO dto);
    ConvenioDTO findById(Long id);
    List<ConvenioDTO> findAllActive();
    List<ConvenioDTO> findByEmpresaId(Long empresaId);
    void disable(Long id);
    List<ConvenioDTO> findExpiringConvenios(int daysBeforeExpiration);
    Boolean validarVigencia(Long id);
}

