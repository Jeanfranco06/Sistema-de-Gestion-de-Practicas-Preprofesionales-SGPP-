package edu.unt.ingenieria_industrial.sgpp.core.expediente.service;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;

import java.util.Collection;

public interface ExpedienteAccesoService {

    void verificarLectura(Expediente expediente, Long idUsuario, Collection<String> roles);

    void verificarEscritura(Expediente expediente, Long idUsuario, Collection<String> roles);

    boolean puedeLeer(Expediente expediente, Long idUsuario, Collection<String> roles);
}
