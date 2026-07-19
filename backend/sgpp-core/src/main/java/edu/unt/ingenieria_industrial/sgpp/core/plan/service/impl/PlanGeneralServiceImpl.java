package edu.unt.ingenieria_industrial.sgpp.core.plan.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.EstadoExpediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteEstado;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteEstadoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.plan.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.plan.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.plan.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.plan.service.PlanGeneralService;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.service.PlazoService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PlanGeneralServiceImpl implements PlanGeneralService {

    private static final String TIPO_INICIAL = "INICIAL";
    private static final String ESTADO_BORRADOR = "BORRADOR";
    private static final String ESTADO_PRESENTADO = "PRESENTADO";
    private static final String ESTADO_EN_REVISION = "EN_REVISION";
    private static final String ESTADO_OBSERVADO = EstadoExpediente.PLAN_OBSERVADO.getCodigo();
    private static final String ESTADO_APROBADO = EstadoExpediente.PLAN_APROBADO.getCodigo();
    private static final String ESTADO_RECHAZADO = EstadoExpediente.RECHAZADO.getCodigo();

    private static final String SECCION_CARATULA = "CARATULA";
    private static final String SECCION_DATOS_EMPRESA = "DATOS_EMPRESA";
    private static final String SECCION_AREA_DEPARTAMENTO = "AREA_DEPARTAMENTO";
    private static final String SECCION_SITUACION_PROBLEMATICA = "SITUACION_PROBLEMATICA";
    private static final String SECCION_TECNICAS_PROCEDIMIENTOS = "TECNICAS_PROCEDIMIENTOS";
    private static final String SECCION_TEORIAS_TECNICAS = "TEORIAS_TECNICAS";

    private final PlanGeneralRepository planRepository;
    private final PlanSeccionRepository seccionRepository;
    private final PlanObjetivoRepository objetivoRepository;
    private final PlanCronogramaActividadRepository cronogramaRepository;
    private final PlanObservacionRepository observacionRepository;
    private final PlanHistorialEstadoRepository historialRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ExpedienteEstadoRepository expedienteEstadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;
    private final PlazoService plazoService;

    @Override
    public PlanGeneralResponse registrar(RegistrarPlanRequest request, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(request.getIdExpediente())
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));

        String tipoCodigo = expediente.getTipoPractica().getCodigo();
        String estadoExp = expediente.getEstado();

        boolean puedeRegistrar = false;
        if (TIPO_INICIAL.equals(tipoCodigo)) {
            puedeRegistrar = "ASESOR_ASIGNADO".equals(estadoExp) || "EMPRESA_SEDE_ASIGNADA".equals(estadoExp)
                    || EstadoExpediente.PLAN_PRESENTADO.getCodigo().equals(estadoExp) || EstadoExpediente.PLAN_OBSERVADO.getCodigo().equals(estadoExp)
                    || "SUBSANADO".equals(estadoExp);
        } else {
            puedeRegistrar = "COMITE_ASIGNADO".equals(estadoExp) || "EMPRESA_SEDE_ASIGNADA".equals(estadoExp)
                    || "CARTA_ACEPTACION_PRESENTADA".equals(estadoExp)
                    || EstadoExpediente.PLAN_PRESENTADO.getCodigo().equals(estadoExp) || EstadoExpediente.PLAN_OBSERVADO.getCodigo().equals(estadoExp)
                    || "SUBSANADO".equals(estadoExp);
        }
        if (!puedeRegistrar) {
            throw new BusinessException("El expediente no está en un estado que permita registrar el plan general");
        }

        Optional<PlanGeneral> activoOpt = planRepository
                .findTopByExpedienteIdAndActivoTrueOrderByVersionDesc(expediente.getId());
        if (activoOpt.isPresent()) {
            PlanGeneral activo = activoOpt.get();
            if (!EstadoExpediente.PLAN_OBSERVADO.getCodigo().equals(activo.getEstado()) && !EstadoExpediente.RECHAZADO.getCodigo().equals(activo.getEstado())) {
                throw new BusinessException("Ya existe un plan activo para este expediente. " +
                        "Debe estar observado o rechazado para crear una nueva versión.");
            }
        }

        Usuario usuario = usuarioRepository.getReferenceById(idUsuario);

        int nuevaVersion = activoOpt
                .map(p -> p.getVersion() + 1)
                .orElse(1);

        PlanGeneral plan = PlanGeneral.builder()
                .expediente(expediente)
                .version(nuevaVersion)
                .estado(ESTADO_BORRADOR)
                .build();
        plan = planRepository.save(plan);

        guardarSecciones(plan, request);
        guardarObjetivos(plan, request.getObjetivos());
        guardarCronograma(plan, request.getObjetivos(), request.getCronograma());

        log.info("Plan General v{} creado para expediente {}", nuevaVersion, expediente.getCodigoExpediente());
        return toResponse(plan);
    }

    @Override
    public PlanGeneralResponse presentar(Long idPlan, Long idUsuario) {
        PlanGeneral plan = findPlan(idPlan);
        if (!ESTADO_BORRADOR.equals(plan.getEstado())) {
            throw new BusinessException("Solo se puede presentar un plan en estado BORRADOR");
        }

        ValidacionEstructuraResponse validacion = validarEstructura(idPlan);
        if (!validacion.valido()) {
            throw new BusinessException("El plan no cumple con la estructura mínima requerida: " +
                    String.join("; ", validacion.errores()));
        }

        Expediente expediente = plan.getExpediente();
        String tipoCodigo = expediente.getTipoPractica().getCodigo();

        String codigoRegla = TIPO_INICIAL.equals(tipoCodigo)
                ? "PRESENTACION_PLAN_INICIAL" : "PRESENTACION_PLAN_FINAL";

        LocalDate fechaBase = determinarFechaBasePresentacion(expediente, tipoCodigo);
        if (fechaBase != null) {
            plazoService.iniciarPlazo(expediente.getId(), codigoRegla, fechaBase,
                    plan.getId(), null, "Inicio de plazo para presentación del plan");
        }

        plazoService.validarEntregaOPresentacion(expediente.getId(), codigoRegla);
        plazoService.registrarCumplimiento(expediente.getId(), codigoRegla, LocalDate.now());

        String estadoAnterior = plan.getEstado();
        plan.setEstado(ESTADO_PRESENTADO);
        plan.setFechaPresentacion(LocalDateTime.now());
        plan = planRepository.save(plan);

        String estadoAnteriorExp = expediente.getEstado();
        String nuevoEstadoExp = EstadoExpediente.PLAN_PRESENTADO.getCodigo();
        expediente.setEstado(nuevoEstadoExp);
        expediente.setFechaPresentacionPlan(LocalDateTime.now());
        expedienteRepository.save(expediente);

        registrarCambioEstado(plan, estadoAnterior, ESTADO_PRESENTADO, idUsuario,
                "Plan General presentado", "PRESENTACION_PLAN");

        ExpedienteEstado expEstado = ExpedienteEstado.builder()
                .expediente(expediente)
                .estadoAnterior(estadoAnteriorExp)
                .estadoNuevo(nuevoEstadoExp)
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .observacion("Plan General v" + plan.getVersion() + " presentado")
                .tipoCambio("PRESENTACION_PLAN")
                .build();
        expedienteEstadoRepository.save(expEstado);

        log.info("Plan General v{} presentado para expediente {}", plan.getVersion(), expediente.getCodigoExpediente());
        return toResponse(plan);
    }

    @Override
    public PlanGeneralResponse observar(Long idPlan, ObservarPlanRequest request, Long idUsuario) {
        PlanGeneral plan = findPlan(idPlan);
        if (!ESTADO_PRESENTADO.equals(plan.getEstado()) && !ESTADO_EN_REVISION.equals(plan.getEstado())) {
            throw new BusinessException("Solo se puede observar un plan en estado PRESENTADO o EN_REVISION");
        }

        String estadoAnterior = plan.getEstado();
        plan.setEstado(ESTADO_OBSERVADO);
        plan.setFechaUltimaRevision(LocalDateTime.now());
        plan = planRepository.save(plan);

        PlanObservacion obs = PlanObservacion.builder()
                .plan(plan)
                .usuarioOrigen(usuarioRepository.getReferenceById(idUsuario))
                .descripcion(request.getDescripcion())
                .tipo("OBSERVACION")
                .build();
        observacionRepository.save(obs);

        Expediente expediente = plan.getExpediente();
        String estadoAnteriorExp = expediente.getEstado();
        expediente.setEstado(EstadoExpediente.PLAN_OBSERVADO.getCodigo());
        expedienteRepository.save(expediente);

        plazoService.iniciarPlazo(expediente.getId(), "SUBSANACION_PLAN",
                LocalDate.now(), plan.getId(), null,
                "Plazo para subsanar observaciones del Plan General v" + plan.getVersion());

        registrarCambioEstado(plan, estadoAnterior, ESTADO_OBSERVADO, idUsuario,
                truncar(request.getDescripcion(), 200), "OBSERVACION");

        ExpedienteEstado expEstado = ExpedienteEstado.builder()
                .expediente(expediente)
                .estadoAnterior(estadoAnteriorExp)
                .estadoNuevo(EstadoExpediente.PLAN_OBSERVADO.getCodigo())
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .observacion("Plan General observado: " + truncar(request.getDescripcion(), 200))
                .tipoCambio("OBSERVACION_PLAN")
                .build();
        expedienteEstadoRepository.save(expEstado);

        return toResponse(plan);
    }

    @Override
    public PlanGeneralResponse subsanar(Long idPlan, SubsanarPlanRequest request, Long idUsuario) {
        PlanGeneral plan = findPlan(idPlan);
        if (!ESTADO_OBSERVADO.equals(plan.getEstado())) {
            throw new BusinessException("Solo se puede subsanar un plan en estado OBSERVADO");
        }

        Expediente expediente = plan.getExpediente();
        plazoService.validarEntregaOPresentacion(expediente.getId(), "SUBSANACION_PLAN");

        Usuario usuario = usuarioRepository.getReferenceById(idUsuario);

        for (Long obsId : request.getObservacionIds()) {
            PlanObservacion obs = observacionRepository.findById(obsId)
                    .orElseThrow(() -> new ResourceNotFoundException("Observación no encontrada: " + obsId));
            if (!obs.getPlan().getId().equals(idPlan)) {
                throw new BusinessException("La observación " + obsId + " no pertenece a este plan");
            }
            obs.setSubsanado(true);
            obs.setFechaSubsanacion(LocalDateTime.now());
            obs.setRespuestaSubsanacion(request.getRespuesta());
            observacionRepository.save(obs);
        }

        String estadoAnterior = plan.getEstado();

        plan.setVersion(plan.getVersion() + 1);
        plan.setObservacionGeneral(null);

        actualizarSecciones(plan, request);
        actualizarObjetivos(plan, request.getObjetivos());
        actualizarCronograma(plan, request.getObjetivos(), request.getCronograma());

        ValidacionEstructuraResponse validacion = validarEstructura(plan);
        if (!validacion.valido()) {
            plan.setEstado(ESTADO_BORRADOR);
            planRepository.save(plan);
            registrarCambioEstado(plan, estadoAnterior, ESTADO_BORRADOR, idUsuario,
                    "Subsanación incompleta: " + String.join("; ", validacion.errores()), "SUBSANACION_INCOMPLETA");
            throw new BusinessException("La subsanación no cumple la estructura mínima. " +
                    "Corrija los errores antes de presentar: " + String.join("; ", validacion.errores()));
        }

        plan.setEstado(ESTADO_PRESENTADO);
        plan.setFechaPresentacion(LocalDateTime.now());
        plan = planRepository.save(plan);

        expediente.setEstado(EstadoExpediente.PLAN_PRESENTADO.getCodigo());
        expedienteRepository.save(expediente);

        plazoService.registrarCumplimiento(expediente.getId(), "SUBSANACION_PLAN", LocalDate.now());

        registrarCambioEstado(plan, estadoAnterior, ESTADO_PRESENTADO, idUsuario,
                "Subsanación v" + plan.getVersion(), "SUBSANACION");

        ExpedienteEstado expEstado = ExpedienteEstado.builder()
                .expediente(expediente)
                .estadoAnterior(EstadoExpediente.PLAN_OBSERVADO.getCodigo())
                .estadoNuevo(EstadoExpediente.PLAN_PRESENTADO.getCodigo())
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .observacion("Plan General v" + plan.getVersion() + " subsanado y presentado")
                .tipoCambio("SUBSANACION_PLAN")
                .build();
        expedienteEstadoRepository.save(expEstado);

        return toResponse(plan);
    }

    @Override
    public PlanGeneralResponse aprobar(Long idPlan, Long idUsuario) {
        PlanGeneral plan = findPlan(idPlan);
        if (!ESTADO_PRESENTADO.equals(plan.getEstado()) && !ESTADO_EN_REVISION.equals(plan.getEstado())) {
            throw new BusinessException("Solo se puede aprobar un plan en estado PRESENTADO o EN_REVISION");
        }

        ValidacionEstructuraResponse validacion = validarEstructura(plan);
        if (!validacion.valido()) {
            throw new BusinessException("No se puede aprobar un plan que no cumple la estructura mínima. " +
                    String.join("; ", validacion.errores()));
        }

        String estadoAnterior = plan.getEstado();
        plan.setEstado(ESTADO_APROBADO);
        plan.setFechaUltimaRevision(LocalDateTime.now());
        plan = planRepository.save(plan);

        Expediente expediente = plan.getExpediente();
        String estadoAnteriorExp = expediente.getEstado();
        expediente.setPlanTrabajoAprobado(true);
        expediente.setEstado(EstadoExpediente.PLAN_APROBADO.getCodigo());
        expedienteRepository.save(expediente);

        registrarCambioEstado(plan, estadoAnterior, ESTADO_APROBADO, idUsuario,
                "Plan General aprobado", "APROBACION");

        ExpedienteEstado expEstado = ExpedienteEstado.builder()
                .expediente(expediente)
                .estadoAnterior(estadoAnteriorExp)
                .estadoNuevo(EstadoExpediente.PLAN_APROBADO.getCodigo())
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .observacion("Plan General v" + plan.getVersion() + " aprobado")
                .tipoCambio("APROBACION_PLAN")
                .build();
        expedienteEstadoRepository.save(expEstado);

        log.info("Plan General v{} aprobado para expediente {}", plan.getVersion(), expediente.getCodigoExpediente());
        return toResponse(plan);
    }

    @Override
    public PlanGeneralResponse rechazar(Long idPlan, String observacion, Long idUsuario) {
        PlanGeneral plan = findPlan(idPlan);
        if (!ESTADO_PRESENTADO.equals(plan.getEstado()) && !ESTADO_EN_REVISION.equals(plan.getEstado())) {
            throw new BusinessException("Solo se puede rechazar un plan en estado PRESENTADO o EN_REVISION");
        }

        String estadoAnterior = plan.getEstado();
        plan.setEstado(ESTADO_RECHAZADO);
        plan.setObservacionGeneral(observacion);
        plan.setFechaUltimaRevision(LocalDateTime.now());
        plan = planRepository.save(plan);

        Expediente expediente = plan.getExpediente();
        String estadoAnteriorExp = expediente.getEstado();
        expediente.setEstado(EstadoExpediente.RECHAZADO.getCodigo());
        expedienteRepository.save(expediente);

        registrarCambioEstado(plan, estadoAnterior, ESTADO_RECHAZADO, idUsuario,
                observacion != null ? truncar(observacion, 200) : "Plan rechazado", "RECHAZO");

        ExpedienteEstado expEstado = ExpedienteEstado.builder()
                .expediente(expediente)
                .estadoAnterior(estadoAnteriorExp)
                .estadoNuevo(EstadoExpediente.RECHAZADO.getCodigo())
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .observacion("Plan General v" + plan.getVersion() + " rechazado: " + truncar(observacion, 200))
                .tipoCambio("RECHAZO_PLAN")
                .build();
        expedienteEstadoRepository.save(expEstado);

        return toResponse(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public PlanGeneralResponse findById(Long id) {
        PlanGeneral plan = planRepository.findByIdWithExpediente(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan General no encontrado: " + id));
        return toResponse(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public PlanGeneralResponse findActivoByExpedienteId(Long expedienteId) {
        PlanGeneral plan = planRepository
                .findTopByExpedienteIdAndActivoTrueOrderByVersionDesc(expedienteId)
                .orElse(null);
        if (plan == null) return null;
        PlanGeneral full = planRepository.findByIdWithExpediente(plan.getId()).orElse(plan);
        return toResponse(full);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanGeneralResponse> listarPorExpediente(Long expedienteId) {
        return planRepository.findByExpedienteIdOrderByVersionDesc(expedienteId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionEstructuraResponse validarEstructura(Long idPlan) {
        PlanGeneral plan = planRepository.findByIdWithExpediente(idPlan)
                .orElseThrow(() -> new ResourceNotFoundException("Plan General no encontrado: " + idPlan));
        return validarEstructura(plan);
    }

    @Override
    public void delete(Long id, Long idUsuario) {
        PlanGeneral plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan General no encontrado: " + id));
        plan.setActivo(false);
        planRepository.save(plan);
        registrarCambioEstado(plan, plan.getEstado(), plan.getEstado(), idUsuario,
                "Plan desactivado", "DESACTIVACION");
    }

    private ValidacionEstructuraResponse validarEstructura(PlanGeneral plan) {
        List<String> errores = new ArrayList<>();
        List<String> advertencias = new ArrayList<>();

        Map<String, String> secciones = plan.getSecciones().stream()
                .filter(PlanSeccion::getActivo)
                .collect(Collectors.toMap(
                        PlanSeccion::getTipoSeccion,
                        s -> s.getContenido() != null ? s.getContenido() : "",
                        (a, b) -> a
                ));

        if (!secciones.containsKey(SECCION_CARATULA)) {
            errores.add("Falta la sección Carátula");
        } else {
            String carJson = secciones.get(SECCION_CARATULA);
            if (carJson.isBlank()) {
                errores.add("La Carátula está vacía");
            } else {
                try {
                    RegistrarPlanRequest.CaratulaData car = objectMapper.readValue(
                            carJson, RegistrarPlanRequest.CaratulaData.class);
                    if (isBlank(car.getInstitucion())) errores.add("Carátula: falta 'institución'");
                    if (isBlank(car.getNombrePlan())) errores.add("Carátula: falta 'nombre del plan'");
                    if (isBlank(car.getAutor())) errores.add("Carátula: falta 'autor'");
                    if (isBlank(car.getAsesor())) errores.add("Carátula: falta 'asesor'");
                    if (car.getFecha() == null) errores.add("Carátula: falta 'fecha'");
                } catch (JsonProcessingException e) {
                    errores.add("Carátula: formato inválido");
                }
            }
        }

        if (!secciones.containsKey(SECCION_DATOS_EMPRESA)) {
            errores.add("Falta la sección Datos de la Empresa");
        } else {
            String empJson = secciones.get(SECCION_DATOS_EMPRESA);
            if (empJson.isBlank()) {
                errores.add("Los Datos de la Empresa están vacíos");
            } else {
                try {
                    RegistrarPlanRequest.EmpresaData emp = objectMapper.readValue(
                            empJson, RegistrarPlanRequest.EmpresaData.class);
                    if (isBlank(emp.getRazonSocial())) errores.add("Empresa: falta 'razón social'");
                    if (isBlank(emp.getDireccion())) errores.add("Empresa: falta 'dirección'");
                    if (isBlank(emp.getRepresentanteLegal())) errores.add("Empresa: falta 'representante legal'");
                    if (isBlank(emp.getTelefono())) errores.add("Empresa: falta 'teléfono'");
                    if (isBlank(emp.getCorreo())) errores.add("Empresa: falta 'correo'");
                    if (isBlank(emp.getCelular())) errores.add("Empresa: falta 'celular'");
                    if (isBlank(emp.getDescripcionGeneral())) errores.add("Empresa: falta 'descripción general'");
                } catch (JsonProcessingException e) {
                    errores.add("Datos de Empresa: formato inválido");
                }
            }
        }

        if (!secciones.containsKey(SECCION_SITUACION_PROBLEMATICA)) {
            errores.add("Falta la sección Situación Problemática");
        } else {
            String contenido = secciones.get(SECCION_SITUACION_PROBLEMATICA);
            if (isBlank(contenido)) {
                errores.add("La sección Situación Problemática está vacía");
            }
        }

        if (!secciones.containsKey(SECCION_TECNICAS_PROCEDIMIENTOS)) {
            errores.add("Falta la sección Técnicas y Procedimientos de Ingeniería Industrial");
        } else {
            String contenido = secciones.get(SECCION_TECNICAS_PROCEDIMIENTOS);
            if (isBlank(contenido)) {
                errores.add("La sección Técnicas y Procedimientos está vacía");
            }
        }

        List<PlanObjetivo> objetivos = plan.getObjetivos().stream()
                .filter(PlanObjetivo::getActivo)
                .collect(Collectors.toList());
        long generales = objetivos.stream().filter(o -> "GENERAL".equals(o.getTipo())).count();
        long especificos = objetivos.stream().filter(o -> "ESPECIFICO".equals(o.getTipo())).count();

        if (generales == 0) {
            errores.add("Debe definir al menos un objetivo general");
        }
        if (especificos < 2) {
            errores.add("Debe definir al menos dos objetivos específicos");
        }
        for (PlanObjetivo obj : objetivos) {
            if (isBlank(obj.getDescripcion())) {
                errores.add("Objetivo " + obj.getTipo() + " (orden " + obj.getOrden() + "): descripción vacía");
            }
        }

        List<PlanCronogramaActividad> actividades = plan.getCronograma().stream()
                .filter(PlanCronogramaActividad::getActivo)
                .collect(Collectors.toList());

        if (actividades.isEmpty()) {
            errores.add("El cronograma debe tener al menos una actividad");
        }
        for (int i = 0; i < actividades.size(); i++) {
            PlanCronogramaActividad act = actividades.get(i);
            if (isBlank(act.getActividad())) {
                errores.add("Cronograma actividad #" + (i + 1) + ": descripción vacía");
            }
            if (act.getFechaInicioPrevista() == null) {
                errores.add("Cronograma actividad #" + (i + 1) + ": falta fecha de inicio");
            }
            if (act.getFechaFinPrevista() == null) {
                errores.add("Cronograma actividad #" + (i + 1) + ": falta fecha de fin");
            }
            if (act.getFechaInicioPrevista() != null && act.getFechaFinPrevista() != null
                    && act.getFechaFinPrevista().isBefore(act.getFechaInicioPrevista())) {
                errores.add("Cronograma actividad #" + (i + 1) + ": fecha fin es anterior a fecha inicio");
            }
            if (act.getObjetivoEspecifico() == null) {
                errores.add("Cronograma actividad #" + (i + 1) + ": debe estar vinculada a un objetivo específico");
            } else {
                boolean valido = objetivos.stream()
                        .anyMatch(o -> o.getId().equals(act.getObjetivoEspecifico().getId())
                                && "ESPECIFICO".equals(o.getTipo()));
                if (!valido) {
                    errores.add("Cronograma actividad #" + (i + 1) +
                            ": el objetivo vinculado no es específico o no pertenece al plan");
                }
            }
        }

        return new ValidacionEstructuraResponse(errores.isEmpty(), errores, advertencias);
    }

    private LocalDate determinarFechaBasePresentacion(Expediente expediente, String tipoCodigo) {
        if (TIPO_INICIAL.equals(tipoCodigo)) {
            return expediente.getFechaInicioPractica() != null
                    ? expediente.getFechaInicioPractica() : LocalDate.now();
        }
        return expediente.getFechaPresentacionPlan() != null
                ? expediente.getFechaPresentacionPlan().toLocalDate() : LocalDate.now();
    }

    private void guardarSecciones(PlanGeneral plan, RegistrarPlanRequest request) {
        guardarSeccion(plan, SECCION_CARATULA, toJson(request.getCaratula()), 1);
        guardarSeccion(plan, SECCION_DATOS_EMPRESA, toJson(request.getDatosEmpresa()), 2);
        if (request.getAreaDepartamento() != null) {
            guardarSeccion(plan, SECCION_AREA_DEPARTAMENTO, toJson(request.getAreaDepartamento()), 3);
        }
        guardarSeccion(plan, SECCION_SITUACION_PROBLEMATICA, request.getSituacionProblematica(), 4);
        guardarSeccion(plan, SECCION_TECNICAS_PROCEDIMIENTOS, request.getTecnicasProcedimientos(), 5);
        if (request.getTeoriasTecnicas() != null && !request.getTeoriasTecnicas().isEmpty()) {
            guardarSeccion(plan, SECCION_TEORIAS_TECNICAS, toJson(request.getTeoriasTecnicas()), 6);
        }
    }

    private void guardarSeccion(PlanGeneral plan, String tipo, String contenido, int orden) {
        PlanSeccion seccion = PlanSeccion.builder()
                .plan(plan)
                .tipoSeccion(tipo)
                .contenido(contenido)
                .orden(orden)
                .build();
        seccionRepository.save(seccion);
    }

    private void guardarObjetivos(PlanGeneral plan, List<RegistrarPlanRequest.ObjetivoData> objetivosData) {
        Map<String, Long> objetivoIdMap = new HashMap<>();
        for (int i = 0; i < objetivosData.size(); i++) {
            var od = objetivosData.get(i);
            PlanObjetivo obj = PlanObjetivo.builder()
                    .plan(plan)
                    .tipo(od.getTipo())
                    .descripcion(od.getDescripcion())
                    .orden(od.getOrden() != null ? od.getOrden() : i + 1)
                    .build();
            obj = objetivoRepository.save(obj);
            objetivoIdMap.put(od.getDescripcion(), obj.getId());
        }
    }

    private void guardarCronograma(PlanGeneral plan, List<RegistrarPlanRequest.ObjetivoData> objetivosData,
                                    List<RegistrarPlanRequest.ActividadData> actividadesData) {
        List<PlanObjetivo> especificos = objetivoRepository
                .findByPlanIdAndTipoAndActivoTrueOrderByOrdenAsc(plan.getId(), "ESPECIFICO");

        for (int i = 0; i < actividadesData.size(); i++) {
            var ad = actividadesData.get(i);
            PlanObjetivo objetivoRef = null;
            if (ad.getIdObjetivoEspecifico() != null) {
                objetivoRef = especificos.stream()
                        .filter(o -> o.getId().equals(ad.getIdObjetivoEspecifico()))
                        .findFirst()
                        .orElse(null);
            }
            if (objetivoRef == null && ad.getIdObjetivoEspecifico() == null) {
                if (!especificos.isEmpty()) {
                    objetivoRef = especificos.get(0);
                }
            }
            if (objetivoRef == null && ad.getIdObjetivoEspecifico() != null) {
                objetivoRef = objetivoRepository.findById(ad.getIdObjetivoEspecifico()).orElse(null);
            }

            PlanCronogramaActividad act = PlanCronogramaActividad.builder()
                    .plan(plan)
                    .objetivoEspecifico(objetivoRef)
                    .actividad(ad.getActividad())
                    .fechaInicioPrevista(ad.getFechaInicioPrevista())
                    .fechaFinPrevista(ad.getFechaFinPrevista())
                    .duracionSemanas(ad.getDuracionSemanas())
                    .orden(ad.getOrden() != null ? ad.getOrden() : i + 1)
                    .build();
            cronogramaRepository.save(act);
        }
    }

    private void actualizarSecciones(PlanGeneral plan, SubsanarPlanRequest request) {
        List<PlanSeccion> existentes = seccionRepository.findByPlanIdAndActivoTrueOrderByOrdenAsc(plan.getId());
        Map<String, PlanSeccion> seccionMap = existentes.stream()
                .collect(Collectors.toMap(PlanSeccion::getTipoSeccion, s -> s));

        actualizarOReemplazarSeccion(plan, seccionMap, SECCION_CARATULA, toJson(request.getCaratula()), 1);
        actualizarOReemplazarSeccion(plan, seccionMap, SECCION_DATOS_EMPRESA, toJson(request.getDatosEmpresa()), 2);
        if (request.getAreaDepartamento() != null) {
            actualizarOReemplazarSeccion(plan, seccionMap, SECCION_AREA_DEPARTAMENTO, toJson(request.getAreaDepartamento()), 3);
        }
        actualizarOReemplazarSeccion(plan, seccionMap, SECCION_SITUACION_PROBLEMATICA, request.getSituacionProblematica(), 4);
        actualizarOReemplazarSeccion(plan, seccionMap, SECCION_TECNICAS_PROCEDIMIENTOS, request.getTecnicasProcedimientos(), 5);
        if (request.getTeoriasTecnicas() != null && !request.getTeoriasTecnicas().isEmpty()) {
            actualizarOReemplazarSeccion(plan, seccionMap, SECCION_TEORIAS_TECNICAS, toJson(request.getTeoriasTecnicas()), 6);
        }
    }

    private void actualizarOReemplazarSeccion(PlanGeneral plan, Map<String, PlanSeccion> seccionMap,
                                               String tipo, String contenido, int orden) {
        if (seccionMap.containsKey(tipo)) {
            PlanSeccion s = seccionMap.get(tipo);
            s.setContenido(contenido);
            s.setOrden(orden);
            seccionRepository.save(s);
        } else {
            guardarSeccion(plan, tipo, contenido, orden);
        }
    }

    private void actualizarObjetivos(PlanGeneral plan, List<RegistrarPlanRequest.ObjetivoData> objetivosData) {
        List<PlanObjetivo> existentes = objetivoRepository.findByPlanIdAndActivoTrueOrderByOrdenAsc(plan.getId());
        for (PlanObjetivo o : existentes) {
            o.setActivo(false);
            objetivoRepository.save(o);
        }
        guardarObjetivos(plan, objetivosData);
    }

    private void actualizarCronograma(PlanGeneral plan, List<RegistrarPlanRequest.ObjetivoData> objetivosData,
                                       List<RegistrarPlanRequest.ActividadData> actividadesData) {
        List<PlanCronogramaActividad> existentes = cronogramaRepository.findByPlanIdAndActivoTrueOrderByOrdenAsc(plan.getId());
        for (PlanCronogramaActividad a : existentes) {
            a.setActivo(false);
            cronogramaRepository.save(a);
        }
        guardarCronograma(plan, objetivosData, actividadesData);
    }

    private void registrarCambioEstado(PlanGeneral plan, String anterior, String nuevo,
                                        Long idUsuario, String observacion, String tipoCambio) {
        PlanHistorialEstado historial = PlanHistorialEstado.builder()
                .plan(plan)
                .estadoAnterior(anterior)
                .estadoNuevo(nuevo)
                .usuario(usuarioRepository.getReferenceById(idUsuario))
                .observacion(observacion)
                .fechaCambio(LocalDateTime.now())
                .tipoCambio(tipoCambio)
                .build();
        historialRepository.save(historial);
    }

    private PlanGeneral findPlan(Long id) {
        return planRepository.findByIdWithExpediente(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan General no encontrado: " + id));
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializando datos del plan", e);
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private String truncar(String texto, int max) {
        if (texto == null) return null;
        return texto.length() <= max ? texto : texto.substring(0, max) + "...";
    }

    private PlanGeneralResponse toResponse(PlanGeneral plan) {
        PlanGeneralResponse.PlanGeneralResponseBuilder builder = PlanGeneralResponse.builder()
                .id(plan.getId())
                .idExpediente(plan.getExpediente().getId())
                .codigoExpediente(plan.getExpediente().getCodigoExpediente())
                .version(plan.getVersion())
                .estado(plan.getEstado())
                .fechaPresentacion(plan.getFechaPresentacion())
                .fechaUltimaRevision(plan.getFechaUltimaRevision())
                .observacionGeneral(plan.getObservacionGeneral())
                .fechaCreacion(plan.getFechaCreacion())
                .fechaActualizacion(plan.getFechaActualizacion());

        for (PlanSeccion s : plan.getSecciones()) {
            if (!Boolean.TRUE.equals(s.getActivo())) continue;
            try {
                switch (s.getTipoSeccion()) {
                    case SECCION_CARATULA:
                        RegistrarPlanRequest.CaratulaData car = objectMapper.readValue(
                                s.getContenido(), RegistrarPlanRequest.CaratulaData.class);
                        builder.caratula(PlanGeneralResponse.CaratulaResponse.builder()
                                .institucion(car.getInstitucion())
                                .nombrePlan(car.getNombrePlan())
                                .autor(car.getAutor())
                                .asesor(car.getAsesor())
                                .fecha(car.getFecha())
                                .build());
                        break;
                    case SECCION_DATOS_EMPRESA:
                        RegistrarPlanRequest.EmpresaData emp = objectMapper.readValue(
                                s.getContenido(), RegistrarPlanRequest.EmpresaData.class);
                        builder.datosEmpresa(PlanGeneralResponse.EmpresaResponse.builder()
                                .razonSocial(emp.getRazonSocial())
                                .direccion(emp.getDireccion())
                                .representanteLegal(emp.getRepresentanteLegal())
                                .telefono(emp.getTelefono())
                                .correo(emp.getCorreo())
                                .celular(emp.getCelular())
                                .descripcionGeneral(emp.getDescripcionGeneral())
                                .build());
                        break;
                    case SECCION_AREA_DEPARTAMENTO:
                        RegistrarPlanRequest.AreaDepartamentoData area = objectMapper.readValue(
                                s.getContenido(), RegistrarPlanRequest.AreaDepartamentoData.class);
                        builder.areaDepartamento(PlanGeneralResponse.AreaDepartamentoResponse.builder()
                                .areaDepartamento(area.getAreaDepartamento())
                                .funcionarioACargo(area.getFuncionarioACargo())
                                .build());
                        break;
                    case SECCION_SITUACION_PROBLEMATICA:
                        builder.situacionProblematica(s.getContenido());
                        break;
                    case SECCION_TECNICAS_PROCEDIMIENTOS:
                        builder.tecnicasProcedimientos(s.getContenido());
                        break;
                    case SECCION_TEORIAS_TECNICAS:
                        List<RegistrarPlanRequest.TeoriaTecnicaData> teorias = objectMapper.readValue(
                                s.getContenido(),
                                objectMapper.getTypeFactory().constructCollectionType(List.class, RegistrarPlanRequest.TeoriaTecnicaData.class));
                        builder.teoriasTecnicas(teorias.stream()
                                .map(t -> PlanGeneralResponse.TeoriaTecnicaResponse.builder()
                                        .nombre(t.getNombre())
                                        .descripcion(t.getDescripcion())
                                        .build())
                                .collect(Collectors.toList()));
                        break;
                }
            } catch (JsonProcessingException e) {
                log.warn("Error deserializando sección {} del plan {}", s.getTipoSeccion(), plan.getId());
            }
        }

        builder.objetivos(plan.getObjetivos().stream()
                .filter(PlanObjetivo::getActivo)
                .map(o -> PlanGeneralResponse.ObjetivoResponse.builder()
                        .id(o.getId())
                        .tipo(o.getTipo())
                        .descripcion(o.getDescripcion())
                        .orden(o.getOrden())
                        .build())
                .sorted(Comparator.comparing(PlanGeneralResponse.ObjetivoResponse::getOrden))
                .collect(Collectors.toList()));

        builder.cronograma(plan.getCronograma().stream()
                .filter(PlanCronogramaActividad::getActivo)
                .map(a -> PlanGeneralResponse.ActividadResponse.builder()
                        .id(a.getId())
                        .idObjetivoEspecifico(a.getObjetivoEspecifico() != null
                                ? a.getObjetivoEspecifico().getId() : null)
                        .actividad(a.getActividad())
                        .fechaInicioPrevista(a.getFechaInicioPrevista())
                        .fechaFinPrevista(a.getFechaFinPrevista())
                        .duracionSemanas(a.getDuracionSemanas())
                        .orden(a.getOrden())
                        .build())
                .sorted(Comparator.comparing(PlanGeneralResponse.ActividadResponse::getOrden))
                .collect(Collectors.toList()));

        builder.observaciones(plan.getObservaciones().stream()
                .map(o -> PlanGeneralResponse.ObservacionResponse.builder()
                        .id(o.getId())
                        .idUsuarioOrigen(o.getUsuarioOrigen().getId())
                        .nombreUsuarioOrigen(o.getUsuarioOrigen().getNombres() + " "
                                + o.getUsuarioOrigen().getApellidoPaterno())
                        .descripcion(o.getDescripcion())
                        .tipo(o.getTipo())
                        .subsanado(o.getSubsanado())
                        .fechaSubsanacion(o.getFechaSubsanacion())
                        .respuestaSubsanacion(o.getRespuestaSubsanacion())
                        .fechaCreacion(o.getFechaCreacion())
                        .build())
                .sorted(Comparator.comparing(PlanGeneralResponse.ObservacionResponse::getFechaCreacion))
                .collect(Collectors.toList()));

        builder.historialEstados(plan.getHistorialEstados().stream()
                .map(h -> PlanGeneralResponse.HistorialEstadoResponse.builder()
                        .id(h.getId())
                        .estadoAnterior(h.getEstadoAnterior())
                        .estadoNuevo(h.getEstadoNuevo())
                        .idUsuario(h.getUsuario().getId())
                        .nombreUsuario(h.getUsuario().getNombres() + " "
                                + h.getUsuario().getApellidoPaterno())
                        .observacion(h.getObservacion())
                        .fechaCambio(h.getFechaCambio())
                        .tipoCambio(h.getTipoCambio())
                        .build())
                .sorted(Comparator.comparing(PlanGeneralResponse.HistorialEstadoResponse::getFechaCambio))
                .collect(Collectors.toList()));

        return builder.build();
    }
}
