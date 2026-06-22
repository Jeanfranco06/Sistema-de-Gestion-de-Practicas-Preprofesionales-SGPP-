package edu.unt.ingenieria_industrial.sgpp.core.integridad.service;

import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.ConsultaAuditoriaFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.EventoAuditoriaResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.RegistrarEventoAuditoriaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.TrazabilidadExpedienteDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.AccionAuditoria;

import java.util.List;
import java.util.Map;

public interface AuditoriaTransaccionalService {

    EventoAuditoriaResponseDTO registrar(RegistrarEventoAuditoriaDTO evento);

    EventoAuditoriaResponseDTO registrarCambioEstado(
            Long idExpediente, Long idUsuario, String estadoAnterior, String estadoNuevo,
            String tipoCambio, String motivo);

    EventoAuditoriaResponseDTO registrarIntentoFallido(
            Long idExpediente, Long idUsuario, AccionAuditoria accion,
            String motivo, Map<String, Object> contexto);

    List<EventoAuditoriaResponseDTO> consultar(ConsultaAuditoriaFiltroDTO filtros);

    TrazabilidadExpedienteDTO reconstruirTrazabilidadExpediente(Long idExpediente);
}
