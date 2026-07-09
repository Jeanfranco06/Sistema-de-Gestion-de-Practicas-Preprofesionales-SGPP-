package edu.unt.ingenieria_industrial.sgpp.core.expediente.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ConvenioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.service.PlazoService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.service.NotificacionEventoService;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.RegistrarEventoAuditoriaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.service.AuditoriaTransaccionalService;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.service.ReglasIntegridadService;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.GenerarDocumentoInternoRequest;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.service.ExportacionService;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.AccionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoEntidadAuditable;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ExpedienteServiceImpl implements ExpedienteService {

    private static final String TIPO_INICIAL = "INICIAL";
    private static final String TIPO_FINAL = "FINAL";
    private static final String TIPO_PROFESIONAL = "PROFESIONAL";
    private static final String VALIDADO_SECRETARIA = "VALIDADO_SECRETARIA";
    private static final String CARTA_PRESENTACION_EMITIDA = "CARTA_PRESENTACION_EMITIDA";

    private final ExpedienteRepository expedienteRepository;
    private final ExpedienteEstadoRepository estadoRepository;
    private final ExpedienteDocumentoRepository documentoRepository;
    private final ExpedienteComiteRepository comiteRepository;
    private final ExpedienteObservacionRepository observacionRepository;
    private final EstudianteRepository estudianteRepository;
    private final TipoPracticaRepository tipoPracticaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final SedePracticaRepository sedePracticaRepository;
    private final ConvenioRepository convenioRepository;
    private final PlazoService plazoService;
    private final edu.unt.ingenieria_industrial.sgpp.core.hora.service.ControlHoraService controlHoraService;
    private final AuditoriaTransaccionalService auditoriaService;
    private final ReglasIntegridadService reglasIntegridadService;
    private final ExpedienteAccesoService expedienteAccesoService;
    private final NotificacionEventoService notificacionEventoService;
    private final edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.ComponenteEvaluacionService componenteEvaluacionService;
    private final ExportacionService exportacionService;

    @Override
    public ExpedienteResponse crear(CrearExpedienteRequest request, Long idUsuario) {
        Estudiante estudiante = estudianteRepository.findById(request.getIdEstudiante())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));

        TipoPractica tipoPractica = tipoPracticaRepository.findById(request.getIdTipoPractica())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de práctica no encontrado"));

        if (!Boolean.TRUE.equals(tipoPractica.getActivo())) {
            throw new BusinessException("El tipo de práctica no está activo");
        }

        List<Expediente> activos = expedienteRepository.findActiveByEstudianteId(estudiante.getId());
        if (!activos.isEmpty()) {
            throw new BusinessException("El estudiante ya tiene un expediente activo. Cierre el actual antes de crear uno nuevo.");
        }

        String codigo = generarCodigoExpediente(tipoPractica.getCodigo());
        String numeroExpediente = generarNumeroExpediente(estudiante.getCodigoEstudiantil(), tipoPractica.getCodigo());
        String periodo = request.getPeriodoAcademico();
        if (periodo == null && estudiante.getIdPeriodoAcademicoActual() != null) {
            periodo = String.valueOf(estudiante.getIdPeriodoAcademicoActual());
        }

        Expediente expediente = Expediente.builder()
                .codigoExpediente(codigo)
                .numeroExpediente(numeroExpediente)
                .fechaApertura(LocalDate.now())
                .estudiante(estudiante)
                .tipoPractica(tipoPractica)
                .periodoAcademico(periodo)
                .condicionSolicitante(request.getCondicionSolicitante())
                .estado("SOLICITADO")
                .build();

        expediente = expedienteRepository.save(expediente);
        // Forzar flush para asegurar que el expediente se guarde en la base de datos
        expedienteRepository.flush();
        registrarCambioEstado(expediente, null, "SOLICITADO", idUsuario, "Expediente creado", "CREACION");

        // Generar documento de solicitud automáticamente (desactivado temporalmente)
        // try {
        //     if (expediente.getId() != null && expediente.getId() > 0) {
        //         Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        //         if (usuario != null) {
        //             ExpedienteDocumento documentoSolicitud = ExpedienteDocumento.builder()
        //                     .expediente(expediente)
        //                     .tipoDocumento("SOLICITUD_PRACTICA")
        //                     .nombreArchivo("Solicitud_Practica_" + expediente.getCodigoExpediente() + ".pdf")
        //                     .rutaArchivo("/documentos/solicitudes/" + expediente.getCodigoExpediente() + ".pdf")
        //                     .usuario(usuario)
        //                     .observaciones("Documento de solicitud generado automáticamente al crear expediente")
        //                     .estado("APROBADO")
        //                     .build();
        //             documentoRepository.save(documentoSolicitud);
        //             log.info("Documento de solicitud generado automáticamente para expediente {}", expediente.getCodigoExpediente());
        //         } else {
        //             log.warn("No se pudo generar documento de solicitud: usuario con ID {} no encontrado", idUsuario);
        //         }
        //     } else {
        //         log.warn("No se pudo generar documento de solicitud: expediente no tiene ID válido");
        //     }
        // } catch (Exception e) {
        //     log.warn("No se pudo generar documento de solicitud para expediente {}: {}",
        //             expediente.getId(), e.getMessage());
        // }

        // Inicializar componentes de evaluación según normativa (desactivado temporalmente)
        // try {
        //     componenteEvaluacionService.inicializarComponentes(expediente.getId(), tipoPractica.getCodigo());
        // } catch (Exception e) {
        //     log.warn("No se pudieron inicializar componentes de evaluación para expediente {}: {}",
        //             expediente.getId(), e.getMessage());
        // }

        // Solo registrar auditoría si el expediente existe en la base de datos
        if (expediente.getId() != null && expediente.getId() > 0 && expedienteRepository.existsById(expediente.getId())) {
            try {
                auditoriaService.registrar(RegistrarEventoAuditoriaDTO.builder()
                        .tipoEntidad(TipoEntidadAuditable.EXPEDIENTE)
                        .entidadId(expediente.getId())
                        .idExpediente(expediente.getId())
                        .accion(AccionAuditoria.CREATE)
                        .idUsuario(idUsuario)
                        .valorNuevo(Map.of(
                                "codigoExpediente", codigo,
                                "tipoPractica", tipoPractica.getCodigo(),
                                "estudiante", estudiante.getCodigoEstudiantil()))
                        .motivo("Creación de expediente de práctica")
                        .build());
            } catch (Exception e) {
                log.warn("No se pudo registrar auditoría de creación para expediente {}: {}", expediente.getId(), e.getMessage());
            }
        } else {
            log.warn("No se pudo registrar auditoría de creación: expediente con ID {} no existe en la base de datos", expediente.getId());
        }

        log.info("Expediente {} creado para estudiante {}", codigo, estudiante.getCodigoEstudiantil());
        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse asignarEmpresaSede(Long idExpediente, AsignarEmpresaSedeRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        validarEstadoPara(expediente, "EMPRESA_SEDE_ASIGNADA", "SOLICITADO");

        reglasIntegridadService.validarAsignacionEmpresaSede(
                expediente, request.getIdEmpresa(), request.getIdSedePractica(), request.getIdConvenio());

        Empresa empresa = empresaRepository.findById(request.getIdEmpresa())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada"));

        SedePractica sede = sedePracticaRepository.findById(request.getIdSedePractica())
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada"));

        if (request.getIdConvenio() != null) {
            Convenio convenio = convenioRepository.findById(request.getIdConvenio())
                    .orElseThrow(() -> new ResourceNotFoundException("Convenio no encontrado"));
            expediente.setConvenio(convenio);
        }

        expediente.setEmpresa(empresa);
        expediente.setSedePractica(sede);
        expediente.setEstado("EMPRESA_SEDE_ASIGNADA");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "SOLICITADO", "EMPRESA_SEDE_ASIGNADA", idUsuario,
                "Empresa: " + empresa.getRazonSocial() + " - Sede: " + sede.getNombreSede(), "ASIGNACION_EMPRESA");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse asignarAsesor(Long idExpediente, AsignarAsesorRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String tipoCodigo = expediente.getTipoPractica().getCodigo();

        if (!TIPO_INICIAL.equals(tipoCodigo)) {
            throw new BusinessException("Solo las prácticas iniciales requieren asignación de asesor individual");
        }
        validarEstadoPara(expediente, "ASESOR_ASIGNADO", "EMPRESA_SEDE_ASIGNADA",
                VALIDADO_SECRETARIA, CARTA_PRESENTACION_EMITIDA, "CARTA_ACEPTACION_PRESENTADA");

        Usuario asesor = usuarioRepository.findById(request.getIdAsesor())
                .orElseThrow(() -> new ResourceNotFoundException("Docente asesor no encontrado"));

        expediente.setAsesor(asesor);
        expediente.setResolucionAsesor(request.getResolucion());
        expediente.setEstado("ASESOR_ASIGNADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "EMPRESA_SEDE_ASIGNADA", "ASESOR_ASIGNADO", idUsuario,
                "Asesor: " + asesor.getNombres() + " " + asesor.getApellidoPaterno() +
                " - Resolución: " + request.getResolucion(), "ASIGNACION_ASESOR");

        String nombreEstudiante = expediente.getEstudiante().getUsuario().getNombres() + " "
                + expediente.getEstudiante().getUsuario().getApellidoPaterno();
        notificacionEventoService.notificarAsignacionAsesor(
                asesor.getId(), expediente.getCodigoExpediente(), nombreEstudiante);
        notificacionEventoService.notificarCambioEstadoExpediente(
                expediente.getEstudiante().getUsuario().getId(),
                expediente.getCodigoExpediente(), "ASESOR_ASIGNADO");

        LocalDate fechaBaseInicial = expediente.getFechaInicioPractica() != null
                ? expediente.getFechaInicioPractica() : LocalDate.now();
        plazoService.iniciarPlazo(expediente.getId(), "PRESENTACION_PLAN_INICIAL",
                fechaBaseInicial, null, null,
                "Inicio de plazo para presentación del plan - Práctica Inicial");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse asignarComite(Long idExpediente, AsignarComiteRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String tipoCodigo = expediente.getTipoPractica().getCodigo();

        if (TIPO_INICIAL.equals(tipoCodigo)) {
            throw new BusinessException("Las prácticas iniciales no requieren asignación de comité");
        }
        validarEstadoPara(expediente, "COMITE_ASIGNADO", "CARTA_ACEPTACION_PRESENTADA", "EMPRESA_SEDE_ASIGNADA",
                VALIDADO_SECRETARIA, CARTA_PRESENTACION_EMITIDA);

        List<ExpedienteComite> activos = comiteRepository.findByExpedienteIdAndActivoTrue(idExpediente);
        if (!activos.isEmpty()) {
            throw new BusinessException("El expediente ya tiene un comité asignado");
        }
        if (request.getMiembros().size() > 3) {
            throw new BusinessException("El comité no puede tener más de 3 miembros");
        }

        for (AsignarComiteRequest.MiembroComite miembro : request.getMiembros()) {
            Usuario usuario = usuarioRepository.findById(miembro.getIdUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + miembro.getIdUsuario()));
            ExpedienteComite ec = ExpedienteComite.builder()
                    .expediente(expediente)
                    .usuario(usuario)
                    .rolComite(miembro.getRolComite() != null ? miembro.getRolComite() : "MIEMBRO")
                    .build();
            comiteRepository.save(ec);
        }

        expediente.setEstado("COMITE_ASIGNADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, expediente.getEstado(), "COMITE_ASIGNADO", idUsuario,
                "Comité asignado con " + request.getMiembros().size() + " miembros", "ASIGNACION_COMITE");

        LocalDate fechaBaseFinal = expediente.getFechaPresentacionPlan() != null
                ? expediente.getFechaPresentacionPlan().toLocalDate() : LocalDate.now();
        plazoService.iniciarPlazo(expediente.getId(), "PRESENTACION_PLAN_FINAL",
                fechaBaseFinal, null, null,
                "Inicio de plazo para presentación del plan - Práctica Final/Profesional");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse validarExpediente(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        validarEstadoPara(expediente, VALIDADO_SECRETARIA, "EMPRESA_SEDE_ASIGNADA");

        expediente.setEstado(VALIDADO_SECRETARIA);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "EMPRESA_SEDE_ASIGNADA", VALIDADO_SECRETARIA, idUsuario,
                "Secretaría validó el expediente y lo marcó como listo para emisión de carta", "VALIDACION_SECRETARIA");

        notificacionEventoService.notificarCambioEstadoExpediente(
                expediente.getEstudiante().getUsuario().getId(),
                expediente.getCodigoExpediente(), VALIDADO_SECRETARIA);

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse emitirCartaPresentacion(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        validarEstadoPara(expediente, CARTA_PRESENTACION_EMITIDA, VALIDADO_SECRETARIA);

        expediente.setEstado(CARTA_PRESENTACION_EMITIDA);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, VALIDADO_SECRETARIA, CARTA_PRESENTACION_EMITIDA, idUsuario,
                "Director emitió y firmó la Carta de Presentación", "EMISION_CARTA");

        // Generar documento de Carta de Presentación usando el servicio de exportación
        try {
            GenerarDocumentoInternoRequest request = GenerarDocumentoInternoRequest.builder()
                    .tipoDocumento(TipoDocumentoInstitucional.CARTA_PRESENTACION)
                    .idExpediente(expediente.getId())
                    .observacionesAdicionales("Carta de Presentación emitida y firmada por el Director")
                    .build();

            var archivoExportado = exportacionService.generarDocumentoInterno(request);
            log.info("Documento de Carta de Presentación generado para expediente {}: {}",
                    expediente.getCodigoExpediente(), archivoExportado.getCodigoTrazabilidad());
        } catch (Exception e) {
            log.warn("No se pudo generar documento de Carta de Presentación para expediente {}: {}",
                    expediente.getId(), e.getMessage());
            // No fallar toda la operación si falla la generación del documento
        }

        notificacionEventoService.notificarCambioEstadoExpediente(
                expediente.getEstudiante().getUsuario().getId(),
                expediente.getCodigoExpediente(), CARTA_PRESENTACION_EMITIDA);

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse presentarCartaAceptacion(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        validarEstadoPara(expediente, "CARTA_ACEPTACION_PRESENTADA", CARTA_PRESENTACION_EMITIDA);

        expediente.setCartaAceptacionPresentada(true);
        expediente.setEstado("CARTA_ACEPTACION_PRESENTADA");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, CARTA_PRESENTACION_EMITIDA, "CARTA_ACEPTACION_PRESENTADA", idUsuario,
                "Estudiante presentó la Carta de Aceptación de la empresa", "PRESENTACION_ACEPTACION");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse presentarPlan(Long idExpediente, PresentarPlanRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String tipoCodigo = expediente.getTipoPractica().getCodigo();

        String esperado = TIPO_INICIAL.equals(tipoCodigo) ? "ASESOR_ASIGNADO" : "COMITE_ASIGNADO";
        String label = TIPO_INICIAL.equals(tipoCodigo) ? "ASESOR_ASIGNADO" : "COMITE_ASIGNADO";
        validarEstadoPara(expediente, "PLAN_PRESENTADO", esperado);

        expediente.setFechaPresentacionPlan(request.getFechaPresentacion());
        expediente.setEstado("PLAN_PRESENTADO");
        if (request.getObservaciones() != null) {
            expediente.setObservaciones(request.getObservaciones());
        }
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, label, "PLAN_PRESENTADO", idUsuario,
                "Plan de trabajo presentado el " + request.getFechaPresentacion().toLocalDate(), "PRESENTACION_PLAN");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse agregarDocumento(Long idExpediente, String tipoDocumento, String nombreDoc, String fileName, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        
        ExpedienteDocumento doc = ExpedienteDocumento.builder()
                .expediente(expediente)
                .tipoDocumento(tipoDocumento != null ? tipoDocumento : "ANEXO")
                .nombreArchivo(nombreDoc)
                .rutaArchivo(fileName)
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .build();
                
        documentoRepository.save(doc);

        auditoriaService.registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(TipoEntidadAuditable.DOCUMENTO)
                .entidadId(doc.getId())
                .idExpediente(expediente.getId())
                .accion(AccionAuditoria.CREATE)
                .idUsuario(idUsuario)
                .valorNuevo(Map.of(
                        "tipoDocumento", doc.getTipoDocumento(),
                        "nombreArchivo", doc.getNombreArchivo()))
                .motivo("Documento agregado al expediente")
                .build());

        registrarCambioEstado(expediente, expediente.getEstado(), expediente.getEstado(), idUsuario,
                "Documento agregado: " + doc.getTipoDocumento(), "AGREGAR_DOCUMENTO");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse evaluarDocumento(Long idExpediente, Long idDocumento, String estado, String observaciones, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        
        ExpedienteDocumento doc = documentoRepository.findById(idDocumento)
                .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
                
        if (!doc.getExpediente().getId().equals(idExpediente)) {
            throw new BusinessException("El documento no pertenece a este expediente");
        }

        // Campo estado eliminado del modelo - ya no existe en la base de datos
        // doc.setEstado(estado);
        doc.setObservaciones(observaciones);
        doc.setUsuario(usuarioRepository.getReferenceById(idUsuario));
        
        documentoRepository.save(doc);
        
        // If a document is RECHAZADO or OBSERVADO, log it in the expediente's states or observations (optional)
        registrarCambioEstado(expediente, expediente.getEstado(), expediente.getEstado(), idUsuario,
                "Documento " + doc.getTipoDocumento() + " evaluado: " + estado, "EVALUACION_DOCUMENTO");

        if (expediente.getEstudiante() != null && expediente.getEstudiante().getUsuario() != null) {
            notificacionEventoService.notificarDocumentoEvaluado(
                    expediente.getEstudiante().getUsuario().getUsername(),
                    doc.getTipoDocumento(), estado);
        }
                
        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse agregarObservacion(Long idExpediente, AgregarObservacionRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);

        if (!"EN_REVISION".equals(expediente.getEstado()) && !"PLAN_PRESENTADO".equals(expediente.getEstado())) {
            throw new BusinessException("Solo se pueden agregar observaciones a expedientes en revisión");
        }

        ExpedienteObservacion obs = ExpedienteObservacion.builder()
                .expediente(expediente)
                .usuarioOrigen(usuarioRepository.getReferenceById(idUsuario))
                .tipo("OBSERVACION")
                .descripcion(request.getDescripcion())
                .build();
        observacionRepository.save(obs);

        expediente.setEstado("OBSERVADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "EN_REVISION", "OBSERVADO", idUsuario,
                "Observación: " + truncar(request.getDescripcion(), 200), "OBSERVACION");

        plazoService.iniciarPlazo(expediente.getId(), "SUBSANACION_DOCUMENTO",
                LocalDate.now(), null, null,
                "Plazo para subsanar observaciones de documentos del expediente");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse subsanarObservaciones(Long idExpediente, SubsanarObservacionesRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        validarEstadoPara(expediente, "SUBSANADO", "OBSERVADO");

        reglasIntegridadService.validarSubsanacionPermitida(expediente, idUsuario);

        Usuario usuario = usuarioRepository.getReferenceById(idUsuario);

        for (Long obsId : request.getObservacionIds()) {
            ExpedienteObservacion obs = observacionRepository.findById(obsId)
                    .orElseThrow(() -> new ResourceNotFoundException("Observación no encontrada: " + obsId));
            if (!obs.getExpediente().getId().equals(idExpediente)) {
                throw new BusinessException("La observación " + obsId + " no pertenece a este expediente");
            }
            obs.setSubsanado(true);
            obs.setFechaSubsanacion(LocalDateTime.now());
            obs.setUsuarioSubsana(usuario);
            obs.setRespuestaSubsanacion(request.getRespuesta());
            observacionRepository.save(obs);
        }

        expediente.setEstado("SUBSANADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "OBSERVADO", "SUBSANADO", idUsuario,
                "Subsanación de " + request.getObservacionIds().size() + " observaciones", "SUBSANACION");

        plazoService.registrarCumplimiento(expediente.getId(), "SUBSANACION_DOCUMENTO", LocalDate.now());

        auditoriaService.registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(TipoEntidadAuditable.SUBSANACION)
                .entidadId(idExpediente)
                .idExpediente(idExpediente)
                .accion(AccionAuditoria.SUBSANAR)
                .idUsuario(idUsuario)
                .valorNuevo(Map.of("observacionesSubsanadas", request.getObservacionIds().size()))
                .motivo(request.getRespuesta())
                .cumplimientoPlazo(true)
                .build());

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse aprobarPlan(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        validarEstadoPara(expediente, "APROBADO", "EN_REVISION", "PLAN_PRESENTADO", "SUBSANADO");

        expediente.setPlanTrabajoAprobado(true);
        expediente.setEstado("APROBADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "EN_REVISION", "APROBADO", idUsuario,
                "Plan de trabajo aprobado", "APROBACION");

        if (expediente.getEstudiante() != null && expediente.getEstudiante().getUsuario() != null) {
            notificacionEventoService.notificarPlanAprobado(
                    expediente.getEstudiante().getUsuario().getUsername(),
                    expediente.getCodigoExpediente());
        }

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse aprobarInformeFinal(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);

        validarTransicionManual(expediente.getEstado(), "INFORME_FINAL_APROBADO", expediente.getTipoPractica().getCodigo());

        String estadoAnterior = expediente.getEstado();
        expediente.setEstado("INFORME_FINAL_APROBADO");
        expediente = expedienteRepository.save(expediente);

        registrarCambioEstado(expediente, estadoAnterior, "INFORME_FINAL_APROBADO", idUsuario,
                "Informe final aprobado por comité/coordinación", "APROBACION_INFORME");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse iniciarEjecucion(Long idExpediente, Long idUsuario,
                                                LocalDate fechaInicio, Integer duracionSemanas) {
        Expediente expediente = findExpediente(idExpediente);
        validarEstadoPara(expediente, "EN_EJECUCION", "APROBADO");

        if (!Boolean.TRUE.equals(expediente.getPlanTrabajoAprobado())) {
            throw new BusinessException("El plan de trabajo debe estar aprobado antes de iniciar la ejecución");
        }

        expediente.setFechaInicioPractica(fechaInicio);
        expediente.setDuracionSemanas(duracionSemanas);
        if (fechaInicio != null && duracionSemanas != null) {
            expediente.setFechaFinPractica(fechaInicio.plusWeeks(duracionSemanas));
        }
        expediente.setEstado("EN_EJECUCION");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "APROBADO", "EN_EJECUCION", idUsuario,
                "Ejecución iniciada el " + fechaInicio + " por " + duracionSemanas + " semanas", "INICIO_EJECUCION");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse presentarInformeParcial(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);

        if (!TIPO_INICIAL.equals(expediente.getTipoPractica().getCodigo())) {
            throw new BusinessException("Los informes parciales aplican solo a prácticas iniciales");
        }
        validarEstadoPara(expediente, "INFORME_PARCIAL_PRESENTADO", "EN_EJECUCION");

        int nuevos = expediente.getNumeroInformesParciales() + 1;
        expediente.setNumeroInformesParciales(nuevos);
        expediente.setEstado("INFORME_PARCIAL_PRESENTADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "EN_EJECUCION", "INFORME_PARCIAL_PRESENTADO", idUsuario,
                "Informe parcial #" + nuevos + " presentado", "PRESENTACION_INFORME");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse presentarInformeFinal(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String tipoCodigo = expediente.getTipoPractica().getCodigo();

        if (TIPO_INICIAL.equals(tipoCodigo)) {
            throw new BusinessException("Use presentarInformeParcial para prácticas iniciales");
        }
        validarEstadoPara(expediente, "INFORME_FINAL_PRESENTADO", "EN_EJECUCION");

        expediente.setInformeFinalPresentado(true);
        expediente.setEstado("INFORME_FINAL_PRESENTADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, "EN_EJECUCION", "INFORME_FINAL_PRESENTADO", idUsuario,
                "Informe final presentado", "PRESENTACION_INFORME");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse evaluar(Long idExpediente, EvaluarExpedienteRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String tipoCodigo = expediente.getTipoPractica().getCodigo();
        String estadoActual = expediente.getEstado();

        boolean puedeEvaluar = false;
        if (TIPO_INICIAL.equals(tipoCodigo)) {
            puedeEvaluar = "INFORME_PARCIAL_PRESENTADO".equals(estadoActual) || "EN_EJECUCION".equals(estadoActual);
        } else {
            puedeEvaluar = "INFORME_FINAL_PRESENTADO".equals(estadoActual) || "EN_EJECUCION".equals(estadoActual);
        }

        if (!puedeEvaluar) {
            throw new BusinessException("El expediente debe tener informes presentados para ser evaluado");
        }

        reglasIntegridadService.validarRegistroCalificacion(expediente, request.getCalificacionFinal());

        expediente.setCalificacionFinal(request.getCalificacionFinal());
        if (request.getObservaciones() != null) {
            expediente.setObservaciones(request.getObservaciones());
        }

        String nuevoEstado = Boolean.TRUE.equals(request.getCerrarExpediente()) ? "CERRADO" : "EVALUADO";
        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
                "Evaluación: calificación " + request.getCalificacionFinal(), "EVALUACION");

        auditoriaService.registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(TipoEntidadAuditable.NOTA)
                .entidadId(idExpediente)
                .idExpediente(idExpediente)
                .accion(AccionAuditoria.REGISTRAR_CALIFICACION)
                .idUsuario(idUsuario)
                .valorNuevo(Map.of("calificacionFinal", request.getCalificacionFinal()))
                .motivo("Registro de calificación final de práctica")
                .build());

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse cerrar(Long idExpediente, Long idUsuario, String observacion) {
        Expediente expediente = findExpediente(idExpediente);

        try {
            reglasIntegridadService.validarCierreExpediente(expediente);
        } catch (BusinessException e) {
            auditoriaService.registrarIntentoFallido(
                    idExpediente, idUsuario, AccionAuditoria.CERRAR, e.getMessage(),
                    Map.of("estado", expediente.getEstado()));
            throw e;
        }

        String estadoAnterior = expediente.getEstado();
        expediente.setEstado("CERRADO");
        if (observacion != null) {
            expediente.setObservaciones(observacion);
        }
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoAnterior, "CERRADO", idUsuario,
                observacion != null ? observacion : "Expediente cerrado", "CIERRE");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse cambiarEstado(Long idExpediente, CambioEstadoRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String estadoAnterior = expediente.getEstado();

        validarTransicionManual(estadoAnterior, request.getEstado(), expediente.getTipoPractica().getCodigo());

        expediente.setEstado(request.getEstado());
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoAnterior, request.getEstado(), idUsuario,
                request.getObservacion(), request.getTipoCambio() != null ? request.getTipoCambio() : "CAMBIO_MANUAL");

        return toResponse(expediente);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpedienteResponse findById(Long id) {
        Expediente expediente = findExpediente(id);
        return toResponse(expediente);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpedienteResponse findByIdForUser(Long id, Long idUsuario, Collection<String> roles) {
        Expediente expediente = findExpediente(id);
        expedienteAccesoService.verificarLectura(expediente, idUsuario, roles);
        return toResponse(expediente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findMisExpedientes(Long idUsuario, Collection<String> roles) {
        if (roles.contains("ESTUDIANTE")) {
            return estudianteRepository.findByUsuarioId(idUsuario)
                    .map(est -> findByEstudianteId(est.getId()))
                    .orElse(List.of());
        }
        if (roles.contains("DOCENTE_ASESOR")) {
            return findByAsesorId(idUsuario);
        }
        if (roles.contains("TUTOR_EXTERNO")) {
            return findByTutorUsuarioId(idUsuario);
        }
        if (roles.stream().anyMatch(r -> Set.of("ADMIN_SISTEMA", "SECRETARIA", "COORDINADOR",
                "DIRECTOR", "COMITE_PRACTICAS").contains(r))) {
            return findAll();
        }
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findByEstudianteIdForUser(Long estudianteId, Long idUsuario, Collection<String> roles) {
        if (roles.contains("ESTUDIANTE")) {
            Estudiante estudiante = estudianteRepository.findByUsuarioId(idUsuario)
                    .orElseThrow(() -> new BusinessException("Perfil de estudiante no encontrado"));
            if (!estudiante.getId().equals(estudianteId)) {
                throw new BusinessException("No puede consultar expedientes de otro estudiante");
            }
        }
        return findByEstudianteId(estudianteId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findByAsesorIdForUser(Long asesorId, Long idUsuario, Collection<String> roles) {
        if (roles.contains("DOCENTE_ASESOR") && !idUsuario.equals(asesorId)) {
            throw new BusinessException("No puede consultar expedientes de otro asesor");
        }
        return findByAsesorId(asesorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findAll() {
        return expedienteRepository.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findByEstudianteId(Long estudianteId) {
        return expedienteRepository.findByEstudianteIdOrderByFechaCreacionDesc(estudianteId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findByEstado(String estado) {
        return expedienteRepository.findByEstadoAndActivoTrue(estado).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findByTutorEmpresaId(Long tutorEmpresaId) {
        return expedienteRepository.findByEmpresaIdAndActivoTrue(tutorEmpresaId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findByTutorUsuarioId(Long usuarioId) {
        Map<Long, Expediente> unicos = new LinkedHashMap<>();
        expedienteRepository.findByTutorUsuarioId(usuarioId)
                .forEach(e -> unicos.put(e.getId(), e));
        expedienteRepository.findByTutorEmpresaUsuarioId(usuarioId)
                .forEach(e -> unicos.put(e.getId(), e));
        return unicos.values().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpedienteResponse> findByAsesorId(Long asesorId) {
        return expedienteRepository.findByAsesorIdAndActivoTrue(asesorId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void disable(Long id, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado: " + id));
        expediente.setActivo(false);
        expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, expediente.getEstado(), expediente.getEstado(),
                idUsuario, "Expediente deshabilitado", "DESHABILITACION");
    }

    @Override
    public void emitirDictamen(Long idExpediente, String dictamenTexto, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        Usuario usuario = usuarioRepository.getReferenceById(idUsuario);

        ExpedienteDocumento doc = ExpedienteDocumento.builder()
                .expediente(expediente)
                .tipoDocumento("DICTAMEN_FINAL")
                .nombreArchivo("Dictamen_" + expediente.getCodigoExpediente() + ".pdf")
                .observaciones(dictamenTexto)
                .usuario(usuario)
                .build();
        documentoRepository.save(doc);

        registrarCambioEstado(expediente, expediente.getEstado(), expediente.getEstado(), idUsuario,
                "Dictamen final emitido", "EMISION_DICTAMEN");
    }

    // --- Métodos privados ---

    private Expediente findExpediente(Long id) {
        return expedienteRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado: " + id));
    }

    private void validarEstadoPara(Expediente expediente, String destino, String... esperados) {
        String actual = expediente.getEstado();
        for (String esperado : esperados) {
            if (actual.equals(esperado)) return;
        }
        throw new BusinessException(
                "Estado inválido: " + actual + ". Se requiere uno de: " + String.join(", ", esperados) +
                " para transicionar a " + destino);
    }

    private void validarTransicionManual(String actual, String destino, String tipoCodigo) {
        try {
            EstadoExpediente estadoActual = EstadoExpediente.fromCodigo(actual);
            EstadoExpediente estadoDestino = EstadoExpediente.fromCodigo(destino);
            
            if (!estadoDestino.esTransicionValidaDesde(estadoActual)) {
                throw new BusinessException(
                    "Transición manual no válida de " + actual + " a " + destino + 
                    ". Consulte el flujo normativo para transiciones válidas.");
            }
        } catch (IllegalArgumentException e) {
            // Si los estados no están en el enum, usar validación legacy para compatibilidad
            log.warn("Usando validación legacy para estados: {} -> {}", actual, destino);
            validarTransicionManualLegacy(actual, destino);
        }
    }

    private void validarTransicionManualLegacy(String actual, String destino) {
        Map<String, Set<String>> transiciones = new HashMap<>();
        Set<String> estadosInicial = Set.of("SOLICITADO", "EMPRESA_SEDE_ASIGNADA",
                VALIDADO_SECRETARIA, CARTA_PRESENTACION_EMITIDA,
                "ASESOR_ASIGNADO", "COMITE_ASIGNADO", "PLAN_PRESENTADO", "EN_REVISION",
                "OBSERVADO", "SUBSANADO", "APROBADO", "EN_EJECUCION",
                "INFORME_PARCIAL_PRESENTADO", "INFORME_FINAL_PRESENTADO",
                "EVALUADO", "CARTA_ACEPTACION_PRESENTADA");

        transiciones.put("SOLICITADO", estadosInicial);
        transiciones.put("EMPRESA_SEDE_ASIGNADA", estadosInicial);
        transiciones.put(VALIDADO_SECRETARIA, estadosInicial);
        transiciones.put(CARTA_PRESENTACION_EMITIDA, estadosInicial);
        transiciones.put("CARTA_ACEPTACION_PRESENTADA", estadosInicial);
        transiciones.put("ASESOR_ASIGNADO", estadosInicial);
        transiciones.put("COMITE_ASIGNADO", estadosInicial);

        Set<String> compartido = transiciones.get("SOLICITADO");

        if (!compartido.contains(destino)) {
            throw new BusinessException("Transición manual no válida de " + actual + " a " + destino);
        }
    }

    private void registrarCambioEstado(Expediente expediente, String anterior, String nuevo,
                                        Long idUsuario, String observacion, String tipoCambio) {
        ExpedienteEstado estado = ExpedienteEstado.builder()
                .expediente(expediente)
                .estadoAnterior(anterior)
                .estadoNuevo(nuevo)
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .observacion(observacion)
                .tipoCambio(tipoCambio)
                .build();
        estadoRepository.save(estado);

        // Solo registrar auditoría si el expediente tiene un ID válido
        if (expediente.getId() != null && expediente.getId() > 0) {
            try {
                // Verificar que el expediente existe en la base de datos
                if (expedienteRepository.existsById(expediente.getId())) {
                    auditoriaService.registrarCambioEstado(
                            expediente.getId(), idUsuario, anterior, nuevo, tipoCambio, observacion);
                } else {
                    log.warn("No se pudo registrar auditoría: expediente con ID {} no existe en la base de datos",
                            expediente.getId());
                }
            } catch (Exception e) {
                log.warn("No se pudo registrar evento de auditoría para expediente {}: {}",
                        expediente.getId(), e.getMessage());
            }
        } else {
            log.warn("No se pudo registrar auditoría: expediente no tiene ID válido");
        }
    }

    private String generarCodigoExpediente(String tipoCodigo) {
        String anio = String.valueOf(LocalDate.now().getYear());
        int correlativo = expedienteRepository.findMaxCorrelativoByPrefix("EXP-" + anio + "-" + tipoCodigo + "-") + 1;
        return String.format("EXP-%s-%s-%04d", anio, tipoCodigo, correlativo);
    }

    private String generarNumeroExpediente(String codigoEstudiantil, String tipoCodigo) {
        String anio = String.valueOf(LocalDate.now().getYear());
        return String.format("%s-%s-%s", codigoEstudiantil, tipoCodigo, anio);
    }

    private String truncar(String texto, int max) {
        if (texto == null) return null;
        return texto.length() <= max ? texto : texto.substring(0, max) + "...";
    }

    private ExpedienteResponse toResponse(Expediente e) {
        ExpedienteResponse.ExpedienteResponseBuilder builder = ExpedienteResponse.builder()
                .id(e.getId())
                .codigoExpediente(e.getCodigoExpediente())
                .idEstudiante(e.getEstudiante().getId())
                .codigoEstudiantil(e.getEstudiante().getCodigoEstudiantil())
                .nombreEstudiante(e.getEstudiante().getUsuario().getNombres())
                .apellidoEstudiante(e.getEstudiante().getUsuario().getApellidoPaterno())
                .idTipoPractica(e.getTipoPractica().getId())
                .codigoTipoPractica(e.getTipoPractica().getCodigo())
                .nombreTipoPractica(e.getTipoPractica().getNombre())
                .periodoAcademico(e.getPeriodoAcademico())
                .condicionSolicitante(e.getCondicionSolicitante())
                .estado(e.getEstado())
                .cartaAceptacionPresentada(e.getCartaAceptacionPresentada())
                .planTrabajoAprobado(e.getPlanTrabajoAprobado())
                .fechaPresentacionPlan(e.getFechaPresentacionPlan())
                .fechaInicioPractica(e.getFechaInicioPractica())
                .fechaFinPractica(e.getFechaFinPractica())
                .duracionSemanas(e.getDuracionSemanas())
                .numeroInformesParciales(e.getNumeroInformesParciales())
                .informeFinalPresentado(e.getInformeFinalPresentado())
                .calificacionFinal(e.getCalificacionFinal())
                .observaciones(e.getObservaciones())
                .fechaCreacion(e.getFechaCreacion())
                .fechaActualizacion(e.getFechaActualizacion());

        if (e.getEmpresa() != null) {
            builder.idEmpresa(e.getEmpresa().getId())
                   .nombreEmpresa(e.getEmpresa().getRazonSocial())
                   .rucEmpresa(e.getEmpresa().getRuc());
        }
        if (e.getSedePractica() != null) {
            builder.idSedePractica(e.getSedePractica().getId())
                   .nombreSede(e.getSedePractica().getNombreSede());
        }
        if (e.getAsesor() != null) {
            builder.idAsesor(e.getAsesor().getId())
                   .nombreAsesor(e.getAsesor().getNombres() + " " + e.getAsesor().getApellidoPaterno())
                   .resolucionAsesor(e.getResolucionAsesor());
        }
        if (e.getConvenio() != null) {
            builder.idConvenio(e.getConvenio().getId())
                   .numeroConvenio(e.getConvenio().getNumeroConvenio());
        }

        builder.estadoHistorial(e.getEstados().stream()
                .map(est -> ExpedienteResponse.ExpedienteEstadoResponse.builder()
                        .id(est.getId())
                        .estadoAnterior(est.getEstadoAnterior())
                        .estadoNuevo(est.getEstadoNuevo())
                        .idUsuario(est.getUsuario().getId())
                        .nombreUsuario(est.getUsuario().getNombres() + " " + est.getUsuario().getApellidoPaterno())
                        .fechaCambio(est.getFechaCambio())
                        .observacion(est.getObservacion())
                        .tipoCambio(est.getTipoCambio())
                        .build())
                .sorted(Comparator.comparing(ExpedienteResponse.ExpedienteEstadoResponse::getFechaCambio))
                .collect(Collectors.toList()));

        builder.documentos(e.getDocumentos().stream()
                .map(doc -> ExpedienteResponse.ExpedienteDocumentoResponse.builder()
                        .id(doc.getId())
                        .tipoDocumento(doc.getTipoDocumento())
                        .nombreArchivo(doc.getNombreArchivo())
                        .rutaArchivo(doc.getRutaArchivo())
                        // Campo estado eliminado del modelo - ya no existe en la base de datos
                        // .estado(doc.getEstado())
                        .idUsuario(doc.getUsuario() != null ? doc.getUsuario().getId() : null)
                        .fechaSubida(doc.getFechaSubida())
                        .observaciones(doc.getObservaciones())
                        .build())
                .collect(Collectors.toList()));

        builder.comite(e.getComite().stream()
                .filter(ExpedienteComite::getActivo)
                .map(cm -> ExpedienteResponse.ExpedienteComiteResponse.builder()
                        .id(cm.getId())
                        .idUsuario(cm.getUsuario().getId())
                        .nombreUsuario(cm.getUsuario().getNombres() + " " + cm.getUsuario().getApellidoPaterno())
                        .rolComite(cm.getRolComite())
                        .fechaAsignacion(cm.getFechaAsignacion())
                        .activo(cm.getActivo())
                        .build())
                .collect(Collectors.toList()));

        builder.observacionesList(e.getObservacionesList().stream()
                .map(obs -> ExpedienteResponse.ExpedienteObservacionResponse.builder()
                        .id(obs.getId())
                        .idUsuarioOrigen(obs.getUsuarioOrigen().getId())
                        .nombreUsuarioOrigen(obs.getUsuarioOrigen().getNombres() + " " + obs.getUsuarioOrigen().getApellidoPaterno())
                        .tipo(obs.getTipo())
                        .descripcion(obs.getDescripcion())
                        .fechaCreacion(obs.getFechaCreacion())
                        .subsanado(obs.getSubsanado())
                        .fechaSubsanacion(obs.getFechaSubsanacion())
                        .respuestaSubsanacion(obs.getRespuestaSubsanacion())
                        .build())
                .sorted(Comparator.comparing(ExpedienteResponse.ExpedienteObservacionResponse::getFechaCreacion))
                .collect(Collectors.toList()));

        return builder.build();
    }
}
