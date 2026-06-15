package edu.unt.ingenieria_industrial.sgpp.core.integridad.service;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;

public interface ReglasIntegridadService {

    void validarAsignacionEmpresaSede(Expediente expediente, Long idEmpresa, Long idSede, Long idConvenio);

    void validarCierreExpediente(Expediente expediente);

    void validarRegistroCalificacion(Expediente expediente, java.math.BigDecimal calificacion);

    void validarSubsanacionPermitida(Expediente expediente, Long idUsuario);

    void validarTransicionEstado(Expediente expediente, String estadoDestino);
}
