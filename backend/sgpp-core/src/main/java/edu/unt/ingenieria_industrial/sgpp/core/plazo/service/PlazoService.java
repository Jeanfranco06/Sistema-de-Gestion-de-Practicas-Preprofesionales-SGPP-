package edu.unt.ingenieria_industrial.sgpp.core.plazo.service;

import edu.unt.ingenieria_industrial.sgpp.core.plazo.dto.ControlPlazoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.dto.ReglaPlazoDTO;

import java.time.LocalDate;
import java.util.List;

public interface PlazoService {

    ControlPlazoDTO iniciarPlazo(Long idExpediente, String codigoRegla, LocalDate fechaBase,
                                  Long idPlan, Long idDocumento, String observacion);

    ControlPlazoDTO registrarCumplimiento(Long idExpediente, String codigoRegla,
                                           LocalDate fechaCumplimiento);

    void validarEntregaOPresentacion(Long idExpediente, String codigoRegla);

    ControlPlazoDTO consultarEstado(Long idExpediente, String codigoRegla);

    List<ControlPlazoDTO> listarPlazosPorExpediente(Long idExpediente);

    List<ControlPlazoDTO> listarPlazosVigentes();

    List<ControlPlazoDTO> listarPlazosVencidosOPorroVencer();

    int actualizarEstadosVencidos();

    ControlPlazoDTO cancelarPlazoVigente(Long idExpediente, String codigoRegla, String observacion);

    List<ReglaPlazoDTO> listarReglas();

    List<ReglaPlazoDTO> listarReglasPorTipoPractica(String codigoTipoPractica);
}
