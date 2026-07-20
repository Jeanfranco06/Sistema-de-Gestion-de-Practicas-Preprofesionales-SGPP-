package edu.unt.ingenieria_industrial.sgpp.core.expediente.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ConvenioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.EstadoExpediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteService;
import edu.unt.ingenieria_industrial.sgpp.core.plan.dto.PlanGeneralResponse;
import edu.unt.ingenieria_industrial.sgpp.core.plan.service.PlanGeneralService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.PracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.service.PlazoService;
import edu.unt.ingenieria_industrial.sgpp.core.model.EstadoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.repository.EstadoPracticaRepository;
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
    private static final BigDecimal NOTA_MINIMA_APROBATORIA = new BigDecimal("13.50");

private final ExpedienteRepository expedienteRepository;
    private final ExpedienteEstadoRepository estadoRepository;
    private final ExpedienteDocumentoRepository documentoRepository;
    private final ExpedienteComiteRepository comiteRepository;
    private final ExpedienteObservacionRepository observacionRepository;
    private final EstudianteRepository estudianteRepository;
    private final TipoPracticaRepository tipoPracticaRepository;
    private final PracticaRepository practicaRepository;
    private final EstadoPracticaRepository estadoPracticaRepository;
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
    private final PlanGeneralService planGeneralService;

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

        // Inicializar componentes de evaluación según normativa
        try {
            componenteEvaluacionService.inicializarComponentes(expediente.getId(), tipoPractica.getCodigo());
        } catch (Exception e) {
            log.warn("No se pudieron inicializar componentes de evaluación para expediente {}: {}",
                    expediente.getId(), e.getMessage());
        }

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
        validarEstadoPara(expediente, "ASESOR_ASIGNADO", "CARTA_ACEPTACION_PRESENTADA");

        Usuario asesor = usuarioRepository.findById(request.getIdAsesor())
                .orElseThrow(() -> new ResourceNotFoundException("Docente asesor no encontrado"));

        String estadoAnterior = expediente.getEstado();
        expediente.setAsesor(asesor);
        expediente.setResolucionAsesor(request.getResolucion());
        expediente.setEstado("ASESOR_ASIGNADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoAnterior, "ASESOR_ASIGNADO", idUsuario,
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
        validarEstadoPara(expediente, "COMITE_ASIGNADO", "CARTA_ACEPTACION_PRESENTADA");

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

        String estadoAnteriorComite = expediente.getEstado();
        expediente.setEstado("COMITE_ASIGNADO");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoAnteriorComite, "COMITE_ASIGNADO", idUsuario,
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
        if (!Set.of(CARTA_PRESENTACION_EMITIDA, "CARTA_ACEPTACION_PRESENTADA").contains(expediente.getEstado())) {
            throw new BusinessException("Estado inválido: " + expediente.getEstado()
                    + ". Se requiere " + CARTA_PRESENTACION_EMITIDA + " para presentar la Carta de Aceptación");
        }

        expediente.setCartaAceptacionPresentada(true);
        String estadoAnterior = expediente.getEstado();
        expediente.setEstado("CARTA_ACEPTACION_PRESENTADA");
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoAnterior, "CARTA_ACEPTACION_PRESENTADA", idUsuario,
                estadoAnterior.equals(CARTA_PRESENTACION_EMITIDA)
                        ? "Estudiante presentó la Carta de Aceptación de la empresa"
                        : "Estudiante reemplazó la Carta de Aceptación de la empresa",
                "PRESENTACION_ACEPTACION");

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
    public ExpedienteResponse eliminarDocumento(Long idExpediente, Long idDocumento, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        ExpedienteDocumento doc = documentoRepository.findById(idDocumento)
                .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        if (!doc.getExpediente().getId().equals(idExpediente)) {
            throw new BusinessException("El documento no pertenece a este expediente");
        }
        if ("APROBADO".equals(doc.getEstado())) {
            throw new BusinessException("No se puede eliminar un documento aprobado");
        }
        if (doc.getRutaArchivo() != null && doc.getRutaArchivo().startsWith("registro:")) {
            throw new BusinessException("No se puede eliminar un documento institucional generado por el sistema");
        }
        if ("CARTA_ACEPTACION".equals(doc.getTipoDocumento())) {
            if (!"CARTA_ACEPTACION_PRESENTADA".equals(expediente.getEstado())) {
                throw new BusinessException("La Carta de Aceptación solo puede eliminarse antes de asignar asesor o comité");
            }
            expediente.setCartaAceptacionPresentada(false);
            expediente.setEstado(CARTA_PRESENTACION_EMITIDA);
            expediente = expedienteRepository.save(expediente);
            registrarCambioEstado(expediente, "CARTA_ACEPTACION_PRESENTADA", CARTA_PRESENTACION_EMITIDA, idUsuario,
                    "Estudiante eliminó la Carta de Aceptación para reemplazarla", "ELIMINAR_ACEPTACION");
        }
        documentoRepository.delete(doc);
        registrarCambioEstado(expediente, expediente.getEstado(), expediente.getEstado(), idUsuario,
                "Documento eliminado: " + doc.getTipoDocumento(), "ELIMINAR_DOCUMENTO");
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

        String estadoDestino = estado == null ? "" : estado.trim().toUpperCase(Locale.ROOT);
        validarTransicionDocumento(doc.getEstado(), estadoDestino, observaciones);

        doc.setEstado(estadoDestino);
        doc.setObservaciones(observaciones);
        doc.setUsuario(usuarioRepository.getReferenceById(idUsuario));
        
        documentoRepository.save(doc);
        
        // If a document is RECHAZADO or OBSERVADO, log it in the expediente's states or observations (optional)
        registrarCambioEstado(expediente, expediente.getEstado(), expediente.getEstado(), idUsuario,
                "Documento " + doc.getTipoDocumento() + " evaluado: " + estadoDestino, "EVALUACION_DOCUMENTO");

        if (expediente.getEstudiante() != null && expediente.getEstudiante().getUsuario() != null) {
            notificacionEventoService.notificarDocumentoEvaluado(
                    expediente.getEstudiante().getUsuario().getUsername(),
                    doc.getTipoDocumento(), estadoDestino);
        }
                
        return toResponse(expediente);
    }

    private void validarTransicionDocumento(String estadoActual, String estadoDestino, String observaciones) {
        String actual = estadoActual == null ? "PENDIENTE" : estadoActual;
        boolean permitida = switch (actual) {
            case "PENDIENTE" -> "EN_REVISION".equals(estadoDestino);
            case "EN_REVISION" -> "APROBADO".equals(estadoDestino) || "OBSERVADO".equals(estadoDestino);
            case "OBSERVADO" -> "EN_REVISION".equals(estadoDestino);
            case "APROBADO" -> "ARCHIVADO".equals(estadoDestino);
            default -> false;
        };
        if (!permitida) {
            throw new BusinessException("Transición documental inválida: " + actual + " -> " + estadoDestino);
        }
        if ("OBSERVADO".equals(estadoDestino) && (observaciones == null || observaciones.isBlank())) {
            throw new BusinessException("Debe registrar observaciones al observar un documento");
        }
    }

    @Override
    public ExpedienteResponse agregarObservacion(Long idExpediente, AgregarObservacionRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String estadoActual = expediente.getEstado();

        if (!EstadoExpediente.PLAN_PRESENTADO.getCodigo().equals(estadoActual)
                && !EstadoExpediente.PLAN_EN_REVISION.getCodigo().equals(estadoActual)
                && !EstadoExpediente.EN_REVISION.getCodigo().equals(estadoActual)) {
            throw new BusinessException("Solo se pueden agregar observaciones a expedientes con plan presentado o en revisión");
        }

        ExpedienteObservacion obs = ExpedienteObservacion.builder()
                .expediente(expediente)
                .usuarioOrigen(usuarioRepository.getReferenceById(idUsuario))
                .tipo("OBSERVACION")
                .descripcion(request.getDescripcion())
                .build();
        observacionRepository.save(obs);

        String estadoAnterior = estadoActual;
        String nuevoEstado = EstadoExpediente.PLAN_OBSERVADO.getCodigo();
        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoAnterior, nuevoEstado, idUsuario,
                "Observación: " + truncar(request.getDescripcion(), 200), "OBSERVACION");

        plazoService.iniciarPlazo(expediente.getId(), "SUBSANACION_DOCUMENTO",
                LocalDate.now(), null, null,
                "Plazo para subsanar observaciones de documentos del expediente");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse aprobarPlan(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String estadoActual = expediente.getEstado();
        Set<String> estadosPermitidos = Set.of(
                EstadoExpediente.PLAN_PRESENTADO.getCodigo(),
                EstadoExpediente.PLAN_EN_REVISION.getCodigo(),
                EstadoExpediente.PLAN_OBSERVADO.getCodigo(),
                EstadoExpediente.SUBSANADO.getCodigo());
        if (!estadosPermitidos.contains(estadoActual)) {
            throw new BusinessException("Estado inválido: " + estadoActual + ". Se requiere plan presentado, en revisión, observado o subsanado para aprobar");
        }

        String nuevoEstado = EstadoExpediente.PLAN_APROBADO.getCodigo();
        expediente.setPlanTrabajoAprobado(true);
        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
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
        String estadoActual = expediente.getEstado();
        String nuevoEstado = EstadoExpediente.INFORME_APROBADO.getCodigo();

        Set<String> estadosPermitidos = Set.of(
                EstadoExpediente.INFORME_FINAL_PRESENTADO.getCodigo(),
                EstadoExpediente.INFORME_EN_REVISION.getCodigo());
        if (!estadosPermitidos.contains(estadoActual)) {
            throw new BusinessException("Estado inválido: " + estadoActual + ". Se requiere informe final presentado o en revisión para aprobar");
        }

        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);

        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
                "Informe final aprobado por comité/coordinación", "APROBACION_INFORME");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse iniciarEjecucion(Long idExpediente, Long idUsuario,
                                                LocalDate fechaInicio, Integer duracionSemanas) {
        Expediente expediente = findExpediente(idExpediente);
        String estadoEsperado = EstadoExpediente.PLAN_APROBADO.getCodigo();
        if (!estadoEsperado.equals(expediente.getEstado())) {
            throw new BusinessException("Estado inválido: " + expediente.getEstado() + ". Se requiere " + estadoEsperado + " para iniciar ejecución");
        }

        if (!Boolean.TRUE.equals(expediente.getPlanTrabajoAprobado())) {
            throw new BusinessException("El plan de trabajo debe estar aprobado antes de iniciar la ejecución");
        }

        String estadoAnterior = expediente.getEstado();
        String nuevoEstado = EstadoExpediente.EN_EJECUCION.getCodigo();
        expediente.setFechaInicioPractica(fechaInicio);
        expediente.setDuracionSemanas(duracionSemanas);
        if (fechaInicio != null && duracionSemanas != null) {
            expediente.setFechaFinPractica(fechaInicio.plusWeeks(duracionSemanas));
        }
        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoAnterior, nuevoEstado, idUsuario,
                "Ejecución iniciada el " + fechaInicio + " por " + duracionSemanas + " semanas", "INICIO_EJECUCION");
        controlHoraService.iniciarControlHora(expediente.getId(), idUsuario);

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse presentarInformeParcial(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);

        if (!TIPO_INICIAL.equals(expediente.getTipoPractica().getCodigo())) {
            throw new BusinessException("Los informes parciales aplican solo a prácticas iniciales");
        }
        String estadoActual = expediente.getEstado();
        int numParcial = expediente.getNumeroInformesParciales() != null ? expediente.getNumeroInformesParciales() : 0;
        String nuevoEstado;
        if (numParcial == 0) {
            nuevoEstado = EstadoExpediente.INFORME_PARCIAL_1_PRESENTADO.getCodigo();
        } else if (numParcial == 1) {
            nuevoEstado = EstadoExpediente.INFORME_PARCIAL_2_PRESENTADO.getCodigo();
        } else {
            throw new BusinessException("Ya se presentaron los informes parciales permitidos");
        }

        Set<String> estadosPermitidos = Set.of(
                EstadoExpediente.EN_EJECUCION.getCodigo(),
                EstadoExpediente.INFORME_PARCIAL_1_PRESENTADO.getCodigo());
        if (!estadosPermitidos.contains(estadoActual)) {
            throw new BusinessException("Estado inválido: " + estadoActual + ". Se requiere EN_EJECUCION o INFORME_PARCIAL_1_PRESENTADO para presentar informe parcial");
        }

        int nuevos = numParcial + 1;
        expediente.setNumeroInformesParciales(nuevos);
        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
                "Informe parcial #" + nuevos + " presentado", "PRESENTACION_INFORME");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse presentarInformeFinal(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String tipoCodigo = expediente.getTipoPractica().getCodigo();
        String estadoActual = expediente.getEstado();

        Set<String> estadosPermitidos;
        if (TIPO_INICIAL.equals(tipoCodigo)) {
            estadosPermitidos = Set.of(
                    EstadoExpediente.INFORME_PARCIAL_1_PRESENTADO.getCodigo(),
                    EstadoExpediente.INFORME_PARCIAL_2_PRESENTADO.getCodigo());
        } else {
            estadosPermitidos = Set.of(
                    EstadoExpediente.EN_EJECUCION.getCodigo(),
                    EstadoExpediente.INFORME_PARCIAL_2_PRESENTADO.getCodigo());
        }
        if (!estadosPermitidos.contains(estadoActual)) {
            throw new BusinessException("Estado inválido: " + estadoActual + ". No se puede presentar informe final");
        }

        String nuevoEstado = EstadoExpediente.INFORME_FINAL_PRESENTADO.getCodigo();
        expediente.setInformeFinalPresentado(true);
        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
                "Informe final presentado", "PRESENTACION_INFORME");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse cerrar(Long idExpediente, Long idUsuario, String observacion) {
        Expediente expediente = findExpediente(idExpediente);
        String estadoActual = expediente.getEstado();
        String nuevoEstado = EstadoExpediente.CERRADO.getCodigo();

        Set<String> estadosPermitidos = Set.of(
                EstadoExpediente.EVALUADO.getCodigo(),
                EstadoExpediente.DICTAMEN_EMITIDO.getCodigo(),
                EstadoExpediente.EVALUACION_COMPLETA.getCodigo());
        if (!estadosPermitidos.contains(estadoActual)) {
            throw new BusinessException("Estado inválido: " + estadoActual + ". Se requiere evaluado o dictamen emitido para cerrar");
        }

        try {
            reglasIntegridadService.validarCierreExpediente(expediente);
        } catch (BusinessException e) {
            auditoriaService.registrarIntentoFallido(
                    idExpediente, idUsuario, AccionAuditoria.CERRAR, e.getMessage(),
                    Map.of("estado", expediente.getEstado()));
            throw e;
        }

        expediente.setEstado(nuevoEstado);
        if (observacion != null) {
            expediente.setObservaciones(observacion);
        }
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
                observacion != null ? observacion : "Expediente cerrado", "CIERRE");
        finalizarPracticaActiva(expediente);

        return toResponse(expediente);
    }

    private void finalizarPracticaActiva(Expediente expediente) {
        EstadoPractica estadoCompletada = estadoPracticaRepository.findByCodigo("COMPLETADA")
                .orElseThrow(() -> new BusinessException("No está configurado el estado COMPLETADA para prácticas"));

        practicaRepository.findByEstudianteId(expediente.getEstudiante().getId()).stream()
                .filter(practica -> Boolean.TRUE.equals(practica.getActivo()))
                .filter(practica -> practica.getTipoPractica() != null
                        && practica.getTipoPractica().getId().equals(expediente.getTipoPractica().getId()))
                .filter(practica -> expediente.getSedePractica() == null || practica.getSede() == null
                        || practica.getSede().getId().equals(expediente.getSedePractica().getId()))
                .forEach(practica -> {
                    practica.setEstado(estadoCompletada);
                    practica.setActivo(false);
                    practica.setHorasRestantes(0);
                });
    }

    @Override
    public ExpedienteResponse habilitarExamenAplazados(Long idExpediente, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String estadoActual = expediente.getEstado();

        if (!TIPO_INICIAL.equals(expediente.getTipoPractica().getCodigo())) {
            throw new BusinessException("El examen de aplazados solo aplica a prácticas iniciales");
        }
        if (!EstadoExpediente.EVALUADO.getCodigo().equals(estadoActual)
                && !EstadoExpediente.INFORME_FINAL_PRESENTADO.getCodigo().equals(estadoActual)) {
            throw new BusinessException("El expediente debe estar evaluado o con informe final presentado para habilitar el examen de aplazados");
        }
        if (expediente.getCalificacionFinal() != null
                && expediente.getCalificacionFinal().compareTo(NOTA_MINIMA_APROBATORIA) >= 0) {
            throw new BusinessException("El estudiante ya tiene nota aprobatoria; no requiere examen de aplazados");
        }

        String nuevoEstado = EstadoExpediente.EXAMEN_APLAZADOS_HABILITADO.getCodigo();
        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
                "Habilitado examen de aplazados (semana 17)", "EXAMEN_APLAZADOS");

        notificacionEventoService.notificarPorUsuarioId(expediente.getEstudiante().getUsuario().getId(), "EXAMEN_APLAZADOS",
                "Examen de Aplazados Habilitado",
                "Se habilitó el examen de aplazados para el expediente " + expediente.getCodigoExpediente() + ".");

        return toResponse(expediente);
    }

    @Override
    public ExpedienteResponse registrarExamenAplazados(Long idExpediente, RegistrarExamenAplazadosRequest request, Long idUsuario) {
        Expediente expediente = findExpediente(idExpediente);
        String estadoActual = expediente.getEstado();

        if (!EstadoExpediente.EXAMEN_APLAZADOS_HABILITADO.getCodigo().equals(estadoActual)) {
            throw new BusinessException("El expediente no está habilitado para examen de aplazados");
        }
        if (!TIPO_INICIAL.equals(expediente.getTipoPractica().getCodigo())) {
            throw new BusinessException("El examen de aplazados solo aplica a prácticas iniciales");
        }
        if (request.getNota() == null || request.getNota().compareTo(BigDecimal.ZERO) < 0
                || request.getNota().compareTo(new BigDecimal("20")) > 0) {
            throw new BusinessException("La nota debe estar entre 0 y 20");
        }

        expediente.setNotaExamenAplazados(request.getNota());
        expediente.setFechaExamenAplazados(LocalDate.now());

        String nuevoEstado;
        String mensaje;
        if (request.getNota().compareTo(NOTA_MINIMA_APROBATORIA) >= 0) {
            nuevoEstado = EstadoExpediente.EVALUADO.getCodigo();
            expediente.setCalificacionFinal(request.getNota());
            mensaje = "Aprobó el examen de aplazados con nota " + request.getNota();
        } else {
            nuevoEstado = EstadoExpediente.EXAMEN_APLAZADOS_RENDIDO.getCodigo();
            mensaje = "Rindió el examen de aplazados con nota " + request.getNota();
        }

        expediente.setEstado(nuevoEstado);
        expediente = expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
                mensaje + ". " + (request.getComentarios() != null ? request.getComentarios() : ""), "EXAMEN_APLAZADOS");

        auditoriaService.registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(TipoEntidadAuditable.NOTA)
                .entidadId(idExpediente)
                .idExpediente(idExpediente)
                .accion(AccionAuditoria.REGISTRAR_CALIFICACION)
                .idUsuario(idUsuario)
                .valorNuevo(Map.of("notaExamenAplazados", request.getNota(), "estado", nuevoEstado))
                .motivo("Registro de examen de aplazados")
                .build());

        notificacionEventoService.notificarPorUsuarioId(expediente.getEstudiante().getUsuario().getId(), "EXAMEN_APLAZADOS",
                "Resultado de Examen de Aplazados",
                mensaje + " en el expediente " + expediente.getCodigoExpediente() + ".");

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
        if (roles.contains("COMITE_PRACTICAS")) {
            return comiteRepository.findByUsuarioIdAndActivoTrue(idUsuario).stream()
                    .map(ExpedienteComite::getExpediente)
                    .filter(Expediente::getActivo)
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        if (roles.stream().anyMatch(r -> Set.of("ADMIN_SISTEMA", "SECRETARIA", "COORDINADOR",
                "DIRECTOR").contains(r))) {
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
        String estadoActual = expediente.getEstado();
        String nuevoEstado = EstadoExpediente.DICTAMEN_EMITIDO.getCodigo();
        Set<String> estadosPermitidos = Set.of(
                EstadoExpediente.EVALUACION_COMPLETA.getCodigo(),
                EstadoExpediente.EVALUADO.getCodigo(),
                EstadoExpediente.INFORME_APROBADO.getCodigo());
        if (!estadosPermitidos.contains(estadoActual)) {
            throw new BusinessException("Estado inválido: " + estadoActual + ". Se requiere evaluación completa o informe aprobado para emitir dictamen");
        }

        Usuario usuario = usuarioRepository.getReferenceById(idUsuario);

        try {
            GenerarDocumentoInternoRequest request = GenerarDocumentoInternoRequest.builder()
                    .tipoDocumento(TipoDocumentoInstitucional.DICTAMEN_FINAL)
                    .idExpediente(expediente.getId())
                    .observacionesAdicionales(dictamenTexto)
                    .build();
            var archivoExportado = exportacionService.generarDocumentoInterno(request);
            log.info("Dictamen final generado para expediente {}: {}",
                    expediente.getCodigoExpediente(), archivoExportado.getCodigoTrazabilidad());
        } catch (Exception e) {
            log.warn("No se pudo generar documento de Dictamen para expediente {}: {}",
                    expediente.getId(), e.getMessage());
        }

        ExpedienteDocumento doc = ExpedienteDocumento.builder()
                .expediente(expediente)
                .tipoDocumento("DICTAMEN_FINAL")
                .nombreArchivo("Dictamen_" + expediente.getCodigoExpediente() + ".pdf")
                .observaciones(dictamenTexto)
                .usuario(usuario)
                .build();
        documentoRepository.save(doc);

        expediente.setEstado(nuevoEstado);
        expedienteRepository.save(expediente);
        registrarCambioEstado(expediente, estadoActual, nuevoEstado, idUsuario,
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
                .tipoCalificacion(e.getTipoPractica().getTipoCalificacion())
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
                        .estado(doc.getEstado())
                        .idUsuario(doc.getUsuario() != null ? doc.getUsuario().getId() : null)
                        .fechaSubida(doc.getFechaSubida())
                        .observaciones(doc.getObservaciones())
                        .build())
                .collect(Collectors.toList()));

        // Incluir Plan General (Anexo 1) si existe
        try {
            PlanGeneralResponse planActivo = planGeneralService.findActivoByExpedienteId(e.getId());
            if (planActivo != null) {
                builder.planGeneral(planActivo);
                // También agregarlo como documento virtual en la lista
List<ExpedienteResponse.ExpedienteDocumentoResponse> docs = new ArrayList<>(e.getDocumentos().stream()
                .map(doc -> ExpedienteResponse.ExpedienteDocumentoResponse.builder()
                        .id(doc.getId())
                        .tipoDocumento(doc.getTipoDocumento())
                        .nombreArchivo(doc.getNombreArchivo())
                        .rutaArchivo(doc.getRutaArchivo())
                        .estado(doc.getEstado())
                        .idUsuario(doc.getUsuario() != null ? doc.getUsuario().getId() : null)
                        .fechaSubida(doc.getFechaSubida())
                        .observaciones(doc.getObservaciones())
                        .build())
                .collect(Collectors.toList()));
                docs.add(ExpedienteResponse.ExpedienteDocumentoResponse.builder()
                        .id(planActivo.getId() * -1) // ID negativo para distinguir
                        .tipoDocumento("PLAN_GENERAL")
                        .nombreArchivo("Plan de Prácticas (Anexo 1) v" + planActivo.getVersion() + ".pdf")
                        .rutaArchivo("plan_general:" + planActivo.getId())
                        .estado(planActivo.getEstado())
                        .idUsuario(null)
                        .fechaSubida(planActivo.getFechaPresentacion() != null ? planActivo.getFechaPresentacion() : planActivo.getFechaCreacion())
                        .observaciones("Plan General estructurado - Anexo 1")
                        .build());
                builder.documentos(docs);
            }
        } catch (Exception ex) {
            log.warn("No se pudo cargar plan general para expediente {}", e.getId(), ex);
        }

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
