package edu.unt.ingenieria_industrial.sgpp.core.integridad.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteEstadoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteObservacionRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.model.RegistroGeneracionDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.repository.RegistroGeneracionDocumentalRepository;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.model.EventoAuditoria;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.repository.EventoAuditoriaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.service.AuditoriaTransaccionalService;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.util.ContextoAuditoriaHelper;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.model.ControlPlazo;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.repository.ControlPlazoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.AccionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.OrigenAccionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.ResultadoOperacionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoEntidadAuditable;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditoriaTransaccionalServiceImpl implements AuditoriaTransaccionalService {

    private final EventoAuditoriaRepository eventoRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ExpedienteEstadoRepository estadoRepository;
    private final ExpedienteObservacionRepository observacionRepository;
    private final ControlPlazoRepository controlPlazoRepository;
    private final RegistroGeneracionDocumentalRepository registroDocumentalRepository;
    private final ContextoAuditoriaHelper contextoHelper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public EventoAuditoriaResponseDTO registrar(RegistrarEventoAuditoriaDTO dto) {
        Usuario usuario = contextoHelper.resolverUsuario(dto.getIdUsuario());

        EventoAuditoria evento = EventoAuditoria.builder()
                .tipoEntidad(dto.getTipoEntidad().name())
                .entidadId(dto.getEntidadId())
                .expediente(dto.getIdExpediente() != null
                        ? expedienteRepository.getReferenceById(dto.getIdExpediente()) : null)
                .accion(dto.getAccion().name())
                .usuario(usuario)
                .usernameUsuario(usuario.getUsername())
                .rolUsuario(contextoHelper.obtenerRolesUsuario(usuario))
                .fechaHora(LocalDateTime.now())
                .valorAnterior(serializar(dto.getValorAnterior()))
                .valorNuevo(serializar(dto.getValorNuevo()))
                .motivo(dto.getMotivo())
                .origen(dto.getOrigen().name())
                .resultado(dto.getResultado().name())
                .ipOrigen(dto.getIpOrigen() != null ? dto.getIpOrigen() : contextoHelper.obtenerIpOrigen())
                .detalleAdicional(dto.getDetalleAdicional())
                .cumplimientoPlazo(dto.getCumplimientoPlazo())
                .idControlPlazo(dto.getIdControlPlazo())
                .build();

        return toResponse(eventoRepository.save(evento));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public EventoAuditoriaResponseDTO registrarCambioEstado(
            Long idExpediente, Long idUsuario, String estadoAnterior, String estadoNuevo,
            String tipoCambio, String motivo) {

        Map<String, Object> anterior = Map.of("estado", estadoAnterior != null ? estadoAnterior : "—");
        Map<String, Object> nuevo = Map.of(
                "estado", estadoNuevo,
                "tipoCambio", tipoCambio != null ? tipoCambio : "STATE_CHANGE");

        return registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(TipoEntidadAuditable.EXPEDIENTE_ESTADO)
                .entidadId(idExpediente)
                .idExpediente(idExpediente)
                .accion(AccionAuditoria.CAMBIO_ESTADO)
                .idUsuario(idUsuario)
                .valorAnterior(anterior)
                .valorNuevo(nuevo)
                .motivo(motivo)
                .detalleAdicional("Transición registrada en motor de estados: " + tipoCambio)
                .build());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public EventoAuditoriaResponseDTO registrarIntentoFallido(
            Long idExpediente, Long idUsuario, AccionAuditoria accion,
            String motivo, Map<String, Object> contexto) {

        return registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(TipoEntidadAuditable.EXPEDIENTE)
                .entidadId(idExpediente)
                .idExpediente(idExpediente)
                .accion(accion)
                .idUsuario(idUsuario)
                .valorNuevo(contexto)
                .motivo(motivo)
                .resultado(ResultadoOperacionAuditoria.ERROR_VALIDACION)
                .origen(OrigenAccionAuditoria.API)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoAuditoriaResponseDTO> consultar(ConsultaAuditoriaFiltroDTO filtros) {
        LocalDateTime desde = filtros.getFechaDesde() != null
                ? filtros.getFechaDesde().atStartOfDay() : null;
        LocalDateTime hasta = filtros.getFechaHasta() != null
                ? filtros.getFechaHasta().atTime(LocalTime.MAX) : null;

        return eventoRepository.buscarConFiltros(
                        filtros.getIdExpediente(),
                        filtros.getIdUsuario(),
                        filtros.getTipoEntidad() != null ? filtros.getTipoEntidad().name() : null,
                        filtros.getAccion() != null ? filtros.getAccion().name() : null,
                        filtros.getResultado(),
                        desde, hasta)
                .stream()
                .limit(filtros.getLimite() != null ? filtros.getLimite() : 100)
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TrazabilidadExpedienteDTO reconstruirTrazabilidadExpediente(Long idExpediente) {
        Expediente expediente = expedienteRepository.findById(idExpediente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado: " + idExpediente));

        List<TrazabilidadExpedienteDTO.HitoTrazabilidadDTO> hitos = new ArrayList<>();

        for (ExpedienteEstado ee : estadoRepository.findByExpedienteIdOrderByFechaCambioAsc(idExpediente)) {
            hitos.add(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO.builder()
                    .fechaHora(ee.getFechaCambio())
                    .categoria("ESTADO")
                    .accion(ee.getTipoCambio())
                    .descripcion("Cambio de estado: " + ee.getEstadoAnterior() + " → " + ee.getEstadoNuevo())
                    .actor(ContextoAuditoriaHelper.nombreCompleto(ee.getUsuario()))
                    .valorAnterior(ee.getEstadoAnterior())
                    .valorNuevo(ee.getEstadoNuevo())
                    .motivo(ee.getObservacion())
                    .origenFuente("expediente_estado")
                    .referenciaId(ee.getId())
                    .build());
        }

        for (ExpedienteObservacion obs : observacionRepository.findByExpedienteIdOrderByFechaCreacionAsc(idExpediente)) {
            hitos.add(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO.builder()
                    .fechaHora(obs.getFechaCreacion())
                    .categoria("OBSERVACION")
                    .accion(Boolean.TRUE.equals(obs.getSubsanado()) ? "SUBSANACION" : "OBSERVACION")
                    .descripcion(obs.getDescripcion())
                    .actor(ContextoAuditoriaHelper.nombreCompleto(obs.getUsuarioOrigen()))
                    .valorNuevo(Boolean.TRUE.equals(obs.getSubsanado()) ? "SUBSANADO" : "PENDIENTE")
                    .motivo(obs.getRespuestaSubsanacion())
                    .origenFuente("expediente_observacion")
                    .referenciaId(obs.getId())
                    .build());
            if (Boolean.TRUE.equals(obs.getSubsanado()) && obs.getFechaSubsanacion() != null) {
                hitos.add(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO.builder()
                        .fechaHora(obs.getFechaSubsanacion())
                        .categoria("SUBSANACION")
                        .accion("SUBSANACION")
                        .descripcion("Observación subsanada")
                        .actor(obs.getUsuarioSubsana() != null
                                ? ContextoAuditoriaHelper.nombreCompleto(obs.getUsuarioSubsana()) : null)
                        .motivo(obs.getRespuestaSubsanacion())
                        .origenFuente("expediente_observacion")
                        .referenciaId(obs.getId())
                        .build());
            }
        }

        for (ControlPlazo cp : controlPlazoRepository.findByExpedienteIdWithRegla(idExpediente)) {
            hitos.add(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO.builder()
                    .fechaHora(cp.getFechaCreacion())
                    .categoria("PLAZO")
                    .accion(cp.getReglaPlazo().getCodigo())
                    .descripcion("Plazo " + cp.getReglaPlazo().getNombre() + " — " + cp.getEstado())
                    .valorNuevo("Limite: " + cp.getFechaLimite())
                    .cumplimientoPlazo(cp.getCumplidoEnPlazo())
                    .origenFuente("control_plazo")
                    .referenciaId(cp.getId())
                    .build());
            if (cp.getFechaCumplimiento() != null) {
                hitos.add(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO.builder()
                        .fechaHora(cp.getFechaCumplimiento())
                        .categoria("PLAZO")
                        .accion("CUMPLIMIENTO")
                        .descripcion("Cumplimiento de plazo: " + cp.getReglaPlazo().getCodigo())
                        .cumplimientoPlazo(cp.getCumplidoEnPlazo())
                        .origenFuente("control_plazo")
                        .referenciaId(cp.getId())
                        .build());
            }
        }

        for (RegistroGeneracionDocumental reg : registroDocumentalRepository
                .findByExpedienteIdOrderByFechaGeneracionDesc(idExpediente)) {
            hitos.add(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO.builder()
                    .fechaHora(reg.getFechaGeneracion())
                    .categoria("DOCUMENTO")
                    .accion(reg.getTipoDocumento())
                    .descripcion("Generación documental: " + reg.getNombreArchivo())
                    .actor(ContextoAuditoriaHelper.nombreCompleto(reg.getUsuarioSolicitante()))
                    .origenFuente("registro_generacion_documental")
                    .referenciaId(reg.getId())
                    .build());
        }

        for (EventoAuditoria ea : eventoRepository.findByExpedienteIdOrderByFechaHoraAsc(idExpediente)) {
            hitos.add(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO.builder()
                    .fechaHora(ea.getFechaHora())
                    .categoria("AUDITORIA")
                    .accion(AccionAuditoria.resolverDescripcion(ea.getAccion()))
                    .descripcion(ea.getDetalleAdicional() != null ? ea.getDetalleAdicional() : ea.getMotivo())
                    .actor(ea.getUsernameUsuario())
                    .rolActor(ea.getRolUsuario())
                    .valorAnterior(ea.getValorAnterior())
                    .valorNuevo(ea.getValorNuevo())
                    .motivo(ea.getMotivo())
                    .cumplimientoPlazo(ea.getCumplimientoPlazo())
                    .origenFuente("evento_auditoria")
                    .referenciaId(ea.getId())
                    .build());
        }

        hitos.sort(Comparator.comparing(TrazabilidadExpedienteDTO.HitoTrazabilidadDTO::getFechaHora,
                Comparator.nullsLast(Comparator.naturalOrder())));

        return TrazabilidadExpedienteDTO.builder()
                .idExpediente(idExpediente)
                .codigoExpediente(expediente.getCodigoExpediente())
                .estadoActual(expediente.getEstado())
                .generadoEn(LocalDateTime.now())
                .totalEventos(hitos.size())
                .lineaTiempo(hitos)
                .build();
    }

    private String serializar(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return map.toString();
        }
    }

    private EventoAuditoriaResponseDTO toResponse(EventoAuditoria e) {
        String descripcionAccion = AccionAuditoria.resolverDescripcion(e.getAccion());

        return EventoAuditoriaResponseDTO.builder()
                .id(e.getId())
                .tipoEntidad(e.getTipoEntidad())
                .entidadId(e.getEntidadId())
                .idExpediente(e.getExpediente() != null ? e.getExpediente().getId() : null)
                .codigoExpediente(e.getExpediente() != null ? e.getExpediente().getCodigoExpediente() : null)
                .accion(descripcionAccion)
                .descripcionAccion(descripcionAccion)
                .idUsuario(e.getUsuario() != null ? e.getUsuario().getId() : null)
                .usernameUsuario(e.getUsernameUsuario())
                .nombreUsuario(e.getUsuario() != null ? ContextoAuditoriaHelper.nombreCompleto(e.getUsuario()) : null)
                .rolUsuario(e.getRolUsuario())
                .fechaHora(e.getFechaHora())
                .valorAnterior(e.getValorAnterior())
                .valorNuevo(e.getValorNuevo())
                .motivo(e.getMotivo())
                .origen(e.getOrigen())
                .resultado(e.getResultado())
                .ipOrigen(e.getIpOrigen())
                .detalleAdicional(e.getDetalleAdicional())
                .cumplimientoPlazo(e.getCumplimientoPlazo())
                .idControlPlazo(e.getIdControlPlazo())
                .build();
    }
}
