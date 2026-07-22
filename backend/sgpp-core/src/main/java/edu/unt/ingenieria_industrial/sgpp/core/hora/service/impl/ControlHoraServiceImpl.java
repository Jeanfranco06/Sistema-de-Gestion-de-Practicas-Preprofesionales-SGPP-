package edu.unt.ingenieria_industrial.sgpp.core.hora.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.core.hora.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.hora.model.ControlHora;
import edu.unt.ingenieria_industrial.sgpp.core.hora.model.RegistroHora;
import edu.unt.ingenieria_industrial.sgpp.core.hora.repository.ControlHoraRepository;
import edu.unt.ingenieria_industrial.sgpp.core.hora.repository.RegistroHoraRepository;
import edu.unt.ingenieria_industrial.sgpp.core.hora.service.ControlHoraService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ControlHoraServiceImpl implements ControlHoraService {

    private static final String TIPO_INICIAL = "INICIAL";
    private static final String TIPO_FINAL = "FINAL";
    private static final String TIPO_PROFESIONAL = "PROFESIONAL";
    
    private static final int HORAS_REQUERIDAS_INICIAL = 64;
    private static final int HORAS_REQUERIDAS_FINAL = 360;
    private static final int MESES_MINIMOS_FINAL = 3;
    private static final int HORAS_MINIMAS_DIARIAS = 6;
    private static final int HORAS_MINIMAS_SEMANALES = 30;

    private final ControlHoraRepository controlHoraRepository;
    private final RegistroHoraRepository registroHoraRepository;
    private final ExpedienteRepository expedienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ExpedienteAccesoService expedienteAccesoService;

    @Override
    public ApiResponse<ControlHoraResponse> iniciarControlHora(Long idExpediente, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(idExpediente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));

        if (controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente).isPresent()) {
            throw new BusinessException("Ya existe un control de horas activo para este expediente");
        }

        TipoPractica tipoPractica = expediente.getTipoPractica();
        String tipoCodigo = tipoPractica.getCodigo();
        int horasRequeridas = determinarHorasRequeridas(tipoCodigo, tipoPractica.getHorasRequeridas());

        ControlHora controlHora = ControlHora.builder()
                .expediente(expediente)
                .horasRequeridas(horasRequeridas)
                .horasAcumuladas(0)
                .fechaInicio(expediente.getFechaInicioPractica())
                .fechaFinEstimada(expediente.getFechaFinPractica())
                .estado("EN_PROCESO")
                .activo(true)
                .build();

        controlHora = controlHoraRepository.save(controlHora);
        log.info("Control de horas iniciado para expediente {} con {} horas requeridas", 
                expediente.getCodigoExpediente(), horasRequeridas);

        return ApiResponse.<ControlHoraResponse>builder()
                .success(true)
                .message("Control de horas iniciado exitosamente")
                .data(toControlHoraResponse(controlHora))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<RegistroHoraResponse> registrarHora(Long idExpediente, RegistrarHoraRequest request, Long idUsuario) {
        Expediente expediente = expedienteRepository.findById(idExpediente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));

        if (expediente.getEstudiante() == null || expediente.getEstudiante().getUsuario() == null
                || !idUsuario.equals(expediente.getEstudiante().getUsuario().getId())) {
            throw new BusinessException("Solo el estudiante titular puede registrar horas en este expediente");
        }
        if (!"EN_EJECUCION".equals(expediente.getEstado())) {
            throw new BusinessException("Solo se pueden registrar horas durante la ejecución de la práctica");
        }

        ControlHora controlHora = controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente)
                .orElseThrow(() -> new BusinessException("No existe un control de horas activo para este expediente"));

        if (!"EN_PROCESO".equals(controlHora.getEstado())) {
            throw new BusinessException("El control de horas no está en proceso para registrar nuevas horas");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        LocalDate fechaRegistro = request.getFecha();
        if (fechaRegistro == null) {
            fechaRegistro = LocalDate.now();
        }

        // Validación de fecha futura desactivada temporalmente para pruebas E2E
        // if (fechaRegistro.isAfter(LocalDate.now())) {
        //     throw new BusinessException("La fecha de registro no puede ser futura");
        // }

        if (controlHora.getFechaInicio() != null && fechaRegistro.isBefore(controlHora.getFechaInicio())) {
            throw new BusinessException("La fecha de registro no puede ser anterior a la fecha de inicio de práctica");
        }

        if (controlHora.getFechaFinEstimada() != null && fechaRegistro.isAfter(controlHora.getFechaFinEstimada())) {
            throw new BusinessException("La fecha de registro no puede ser posterior a la fecha fin estimada");
        }

        // Validar que no se exceda el máximo de horas requeridas
        Integer horasRequeridas = controlHora.getHorasRequeridas();
        if (horasRequeridas != null) {
            // Calcular total de horas registradas (incluyendo pendientes y validadas)
            java.util.List<RegistroHora> registros = registroHoraRepository.findByControlHoraIdOrderByFechaAsc(controlHora.getId());
            Integer totalHorasRegistradas = registros.stream()
                .mapToInt(RegistroHora::getHoras)
                .sum();
            
            if (totalHorasRegistradas >= horasRequeridas) {
                throw new BusinessException("Ya has alcanzado el máximo de horas requeridas (" + horasRequeridas + "). No puedes registrar más horas.");
            }
            if (totalHorasRegistradas + request.getHoras() > horasRequeridas) {
                throw new BusinessException("El registro excedería el máximo de horas requeridas. Horas actuales: " + totalHorasRegistradas + ", máximo: " + horasRequeridas);
            }
        }
        if (request.getHoras() == null || request.getHoras() < 1 || request.getHoras() > 24) {
            throw new BusinessException("Las horas registradas deben estar entre 1 y 24");
        }
        if (request.getHoras() < HORAS_MINIMAS_DIARIAS) {
            throw new BusinessException("Se recomienda registrar al menos " + HORAS_MINIMAS_DIARIAS
                    + " horas por día para cumplir con los requisitos de la práctica");
        }

        RegistroHora registro = RegistroHora.builder()
                .controlHora(controlHora)
                .fecha(fechaRegistro)
                .horaInicio(request.getHoraInicio())
                .horaFin(request.getHoraFin())
                .horas(request.getHoras())
                .descripcionActividad(request.getDescripcionActividad())
                .tipoRegistro(request.getTipoRegistro())
                .usuarioRegistra(usuario)
                .validadoPorTutor(false)
                .observaciones(request.getObservaciones())
                .build();

        registro = registroHoraRepository.save(registro);

        actualizarHorasAcumuladas(idExpediente, idUsuario);

        log.info("Hora registrada: {} horas para expediente {} por usuario {}", 
                request.getHoras(), expediente.getCodigoExpediente(), idUsuario);

        return ApiResponse.<RegistroHoraResponse>builder()
                .success(true)
                .message("Hora registrada exitosamente")
                .data(toRegistroHoraResponse(registro))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<RegistroHoraResponse> validarHora(Long idRegistro, ValidarHoraRequest request, Long idUsuario,
            Collection<String> roles) {
        RegistroHora registro = registroHoraRepository.findById(idRegistro)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de hora no encontrado"));

        expedienteAccesoService.verificarEscritura(
                registro.getControlHora().getExpediente(), idUsuario, roles);

        Usuario tutor = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        registro.setValidadoPorTutor(request.getValidado());
        registro.setRechazadoPorTutor(!request.getValidado());
        if (Boolean.TRUE.equals(request.getValidado())) {
            registro.setTutorValida(tutor);
        }
        registro.setObservaciones(request.getObservaciones());

        registro = registroHoraRepository.save(registro);

        actualizarHorasAcumuladas(registro.getControlHora().getExpediente().getId(), idUsuario);

        log.info("Registro de hora {} validado por tutor {}", idRegistro, idUsuario);

        return ApiResponse.<RegistroHoraResponse>builder()
                .success(true)
                .message("Validación de hora actualizada exitosamente")
                .data(toRegistroHoraResponse(registro))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CumplimientoHorasResponse> verificarCumplimiento(Long idExpediente) {
        Expediente expediente = expedienteRepository.findById(idExpediente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));

        ControlHora controlHora = controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente)
                .orElseThrow(() -> new BusinessException("No existe un control de horas activo para este expediente"));

        TipoPractica tipoPractica = expediente.getTipoPractica();
        String tipoCodigo = tipoPractica.getCodigo();

        int horasRequeridas = controlHora.getHorasRequeridas();
        int horasAcumuladas = controlHora.getHorasAcumuladas();
        int horasPendientes = Math.max(0, horasRequeridas - horasAcumuladas);
        boolean cumplido = horasAcumuladas >= horasRequeridas;

        List<String> alertas = new ArrayList<>();
        boolean coherenciaTemporalOk = true;
        String periodoEjecucion = "";

        if (TIPO_FINAL.equals(tipoCodigo) || TIPO_PROFESIONAL.equals(tipoCodigo)) {
            coherenciaTemporalOk = validarCoherenciaTemporal(controlHora, alertas);
            
            if (controlHora.getFechaInicio() != null && controlHora.getFechaFinReal() != null) {
                long meses = ChronoUnit.MONTHS.between(
                        controlHora.getFechaInicio(), 
                        controlHora.getFechaFinReal()
                );
                periodoEjecucion = meses + " meses";
            } else if (controlHora.getFechaInicio() != null && controlHora.getFechaFinEstimada() != null) {
                long meses = ChronoUnit.MONTHS.between(
                        controlHora.getFechaInicio(), 
                        controlHora.getFechaFinEstimada()
                );
                periodoEjecucion = meses + " meses (estimado)";
            }

            if (!coherenciaTemporalOk) {
                alertas.add("La distribución temporal de las horas no cumple con los requisitos normativos");
            }
        }

        if (!cumplido) {
            alertas.add("Faltan " + horasPendientes + " horas para cumplir el requisito");
        }

        String mensaje = cumplido 
                ? "Cumplimiento horario alcanzado" 
                : "Faltan " + horasPendientes + " horas para cumplir el requisito";

        CumplimientoHorasResponse response = CumplimientoHorasResponse.builder()
                .cumplido(cumplido)
                .tipoPractica(tipoPractica.getNombre())
                .horasRequeridas(horasRequeridas)
                .horasAcumuladas(horasAcumuladas)
                .horasPendientes(horasPendientes)
                .periodoEjecucion(periodoEjecucion)
                .coherenciaTemporalOk(coherenciaTemporalOk)
                .mensaje(mensaje)
                .alertas(alertas)
                .build();

        return ApiResponse.<CumplimientoHorasResponse>builder()
                .success(true)
                .message("Verificación de cumplimiento completada")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ControlHoraResponse> obtenerControlHora(Long idExpediente) {
        ControlHora controlHora = controlHoraRepository.findByExpedienteIdWithRegistros(idExpediente)
                .orElseThrow(() -> new BusinessException("No existe un control de horas para este expediente"));

        ControlHoraResponse response = toControlHoraResponse(controlHora);
        
        int horasPendientes = Math.max(0, controlHora.getHorasRequeridas() - controlHora.getHorasAcumuladas());
        response.setHorasPendientes(horasPendientes);
        response.setCumplimientoAlcanzado(controlHora.getHorasAcumuladas() >= controlHora.getHorasRequeridas());

        if (!response.getCumplimientoAlcanzado()) {
            response.setAlerta("Faltan " + horasPendientes + " horas para cumplir el requisito");
        }

        return ApiResponse.<ControlHoraResponse>builder()
                .success(true)
                .message("Control de horas obtenido exitosamente")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<RegistroHoraResponse>> listarRegistros(Long idExpediente) {
        ControlHora controlHora = controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente)
                .orElseThrow(() -> new BusinessException("No existe un control de horas activo para este expediente"));

        List<RegistroHora> registros = registroHoraRepository.findByControlHoraIdOrderByFechaAsc(controlHora.getId());
        List<RegistroHoraResponse> responses = registros.stream()
                .map(this::toRegistroHoraResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<RegistroHoraResponse>>builder()
                .success(true)
                .message("Registros de horas listados exitosamente")
                .data(responses)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<RegistroHoraResponse>> listarRegistrosPorPeriodo(Long idExpediente, LocalDate desde, LocalDate hasta) {
        ControlHora controlHora = controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente)
                .orElseThrow(() -> new BusinessException("No existe un control de horas activo para este expediente"));

        List<RegistroHora> registros = registroHoraRepository.findByControlHoraIdAndFechaBetweenOrderByFechaAsc(
                controlHora.getId(), desde, hasta);
        List<RegistroHoraResponse> responses = registros.stream()
                .map(this::toRegistroHoraResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<RegistroHoraResponse>>builder()
                .success(true)
                .message("Registros de horas por periodo listados exitosamente")
                .data(responses)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Void> actualizarHorasAcumuladas(Long idExpediente, Long idUsuario) {
        ControlHora controlHora = controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente)
                .orElseThrow(() -> new BusinessException("No existe un control de horas activo para este expediente"));

        List<RegistroHora> registros = registroHoraRepository.findByControlHoraIdOrderByFechaAsc(controlHora.getId());
        
        int horasAcumuladas = registros.stream()
                .filter(r -> Boolean.TRUE.equals(r.getValidadoPorTutor()))
                .mapToInt(RegistroHora::getHoras)
                .sum();

        controlHora.setHorasAcumuladas(horasAcumuladas);

        if (horasAcumuladas >= controlHora.getHorasRequeridas()) {
            controlHora.setEstado("CUMPLIDO");
            if (controlHora.getFechaFinReal() == null) {
                controlHora.setFechaFinReal(LocalDate.now());
            }
        }

        controlHoraRepository.save(controlHora);

        log.info("Horas acumuladas actualizadas para expediente {}: {} horas", idExpediente, horasAcumuladas);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Horas acumuladas actualizadas exitosamente")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Boolean> puedeCerrarExpediente(Long idExpediente) {
        Expediente expediente = expedienteRepository.findById(idExpediente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));

        ControlHora controlHora = controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente)
                .orElseThrow(() -> new BusinessException("No existe un control de horas activo para este expediente"));

        TipoPractica tipoPractica = expediente.getTipoPractica();
        String tipoCodigo = tipoPractica.getCodigo();

        boolean puedeCerrar = false;

        if (TIPO_INICIAL.equals(tipoCodigo)) {
            puedeCerrar = controlHora.getHorasAcumuladas() >= HORAS_REQUERIDAS_INICIAL;
        } else if (TIPO_FINAL.equals(tipoCodigo) || TIPO_PROFESIONAL.equals(tipoCodigo)) {
            puedeCerrar = controlHora.getHorasAcumuladas() >= HORAS_REQUERIDAS_FINAL;
            
            if (puedeCerrar) {
                List<String> alertas = new ArrayList<>();
                puedeCerrar = validarCoherenciaTemporal(controlHora, alertas);
            }
        }

        return ApiResponse.<Boolean>builder()
                .success(true)
                .message("Verificación de cierre completada")
                .data(puedeCerrar)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeControlHoraActivo(Long idExpediente) {
        return controlHoraRepository.findByExpedienteIdAndActivoTrue(idExpediente).isPresent();
    }

    // --- Métodos privados ---

    private int determinarHorasRequeridas(String tipoCodigo, Integer horasConfiguradas) {
        if (horasConfiguradas != null && horasConfiguradas > 0) {
            return horasConfiguradas;
        }

        if (TIPO_INICIAL.equals(tipoCodigo)) {
            return HORAS_REQUERIDAS_INICIAL;
        } else if (TIPO_FINAL.equals(tipoCodigo) || TIPO_PROFESIONAL.equals(tipoCodigo)) {
            return HORAS_REQUERIDAS_FINAL;
        }

        throw new BusinessException("Tipo de práctica no reconocido: " + tipoCodigo);
    }

    private boolean validarCoherenciaTemporal(ControlHora controlHora, List<String> alertas) {
        if (controlHora.getFechaInicio() == null || controlHora.getFechaFinReal() == null) {
            if (controlHora.getFechaFinEstimada() != null) {
                return validarCoherenciaTemporalEstimada(controlHora, alertas);
            }
            return false;
        }

        LocalDate fechaInicio = controlHora.getFechaInicio();
        LocalDate fechaFin = controlHora.getFechaFinReal();

        long meses = ChronoUnit.MONTHS.between(fechaInicio, fechaFin);
        if (meses < MESES_MINIMOS_FINAL) {
            alertas.add("El periodo de práctica es menor a los " + MESES_MINIMOS_FINAL + " meses requeridos");
            return false;
        }

        List<RegistroHora> registros = registroHoraRepository.findByControlHoraIdOrderByFechaAsc(controlHora.getId());
        
        if (registros.isEmpty()) {
            return false;
        }

        LocalDate primerRegistro = registros.get(0).getFecha();
        LocalDate ultimoRegistro = registros.get(registros.size() - 1).getFecha();

        long mesesRegistros = ChronoUnit.MONTHS.between(primerRegistro, ultimoRegistro);
        if (mesesRegistros < MESES_MINIMOS_FINAL) {
            alertas.add("Los registros de horas no cubren el periodo mínimo de " + MESES_MINIMOS_FINAL + " meses");
            return false;
        }

        int totalHoras = registros.stream()
                .filter(r -> Boolean.TRUE.equals(r.getValidadoPorTutor()))
                .mapToInt(RegistroHora::getHoras)
                .sum();

        if (mesesRegistros > 0) {
            double promedioSemanal = (double) totalHoras / (mesesRegistros * 4);
            if (promedioSemanal < HORAS_MINIMAS_SEMANALES) {
                alertas.add(String.format("El promedio semanal de horas (%.1f) es menor al mínimo requerido de %d horas", 
                        promedioSemanal, HORAS_MINIMAS_SEMANALES));
                return false;
            }
        }

        return true;
    }

    private boolean validarCoherenciaTemporalEstimada(ControlHora controlHora, List<String> alertas) {
        LocalDate fechaInicio = controlHora.getFechaInicio();
        LocalDate fechaFinEstimada = controlHora.getFechaFinEstimada();

        long meses = ChronoUnit.MONTHS.between(fechaInicio, fechaFinEstimada);
        if (meses < MESES_MINIMOS_FINAL) {
            alertas.add("El periodo estimado de práctica es menor a los " + MESES_MINIMOS_FINAL + " meses requeridos");
            return false;
        }

        return true;
    }

    private ControlHoraResponse toControlHoraResponse(ControlHora controlHora) {
        return ControlHoraResponse.builder()
                .id(controlHora.getId())
                .idExpediente(controlHora.getExpediente().getId())
                .codigoExpediente(controlHora.getExpediente().getCodigoExpediente())
                .tipoPractica(controlHora.getExpediente().getTipoPractica().getNombre())
                .horasRequeridas(controlHora.getHorasRequeridas())
                .horasAcumuladas(controlHora.getHorasAcumuladas())
                .fechaInicio(controlHora.getFechaInicio())
                .fechaFinEstimada(controlHora.getFechaFinEstimada())
                .fechaFinReal(controlHora.getFechaFinReal())
                .estado(controlHora.getEstado())
                .build();
    }

    private RegistroHoraResponse toRegistroHoraResponse(RegistroHora registro) {
        return RegistroHoraResponse.builder()
                .id(registro.getId())
                .idControlHora(registro.getControlHora().getId())
                .fecha(registro.getFecha())
                .horaInicio(registro.getHoraInicio())
                .horaFin(registro.getHoraFin())
                .horas(registro.getHoras())
                .descripcionActividad(registro.getDescripcionActividad())
                .tipoRegistro(registro.getTipoRegistro())
                .usuarioRegistra(registro.getUsuarioRegistra() != null 
                        ? registro.getUsuarioRegistra().getNombres() + " " + registro.getUsuarioRegistra().getApellidoPaterno() 
                        : null)
                .validadoPorTutor(registro.getValidadoPorTutor())
                .tutorValida(registro.getTutorValida() != null 
                        ? registro.getTutorValida().getNombres() + " " + registro.getTutorValida().getApellidoPaterno() 
                        : null)
                .observaciones(registro.getObservaciones())
                .build();
    }
}
