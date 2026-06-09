package edu.unt.ingenieria_industrial.sgpp.core.plazo.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.dto.ControlPlazoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.dto.ReglaPlazoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.model.ControlPlazo;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.model.ReglaPlazo;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.repository.ControlPlazoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.repository.ReglaPlazoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.service.PlazoService;
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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PlazoServiceImpl implements PlazoService {

    private static final String ESTADO_VIGENTE = "VIGENTE";
    private static final String ESTADO_PROXIMO_VENCER = "PROXIMO_A_VENCER";
    private static final String ESTADO_VENCIDO = "VENCIDO";
    private static final String ESTADO_CUMPLIDO_PLAZO = "CUMPLIDO_EN_PLAZO";
    private static final String ESTADO_CUMPLIDO_FUERA = "CUMPLIDO_FUERA_PLAZO";
    private static final String ESTADO_INACTIVO = "INACTIVO";
    private static final String TIPO_COMPUTO_CALENDARIO = "CALENDARIO";

    private final ControlPlazoRepository controlPlazoRepository;
    private final ReglaPlazoRepository reglaPlazoRepository;
    private final ExpedienteRepository expedienteRepository;

    @Override
    public ControlPlazoDTO iniciarPlazo(Long idExpediente, String codigoRegla, LocalDate fechaBase,
                                         Long idPlan, Long idDocumento, String observacion) {
        Expediente expediente = expedienteRepository.findById(idExpediente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado: " + idExpediente));

        ReglaPlazo regla = reglaPlazoRepository.findByCodigoAndActivoTrue(codigoRegla)
                .orElseThrow(() -> new ResourceNotFoundException("Regla de plazo no encontrada: " + codigoRegla));

        if (!TIPO_COMPUTO_CALENDARIO.equals(regla.getTipoComputo())) {
            log.warn("Regla {} tiene tipo de cómputo {}, se usará como días calendario",
                    codigoRegla, regla.getTipoComputo());
        }

        List<String> estadosVigentes = List.of(ESTADO_VIGENTE, ESTADO_PROXIMO_VENCER);
        List<ControlPlazo> existentes = controlPlazoRepository
                .findByExpedienteAndReglaCodigoWithEstados(idExpediente, codigoRegla, estadosVigentes);
        if (!existentes.isEmpty()) {
            log.warn("Ya existe un plazo vigente ({}) para expediente {} regla {}",
                    existentes.get(0).getEstado(), idExpediente, codigoRegla);
            return toDTO(existentes.get(0));
        }

        LocalDate fechaLimite = calcularFechaLimite(fechaBase, regla.getDiasPlazo());

        ControlPlazo control = ControlPlazo.builder()
                .expediente(expediente)
                .reglaPlazo(regla)
                .idPlan(idPlan)
                .idDocumento(idDocumento)
                .fechaBase(fechaBase)
                .fechaLimite(fechaLimite)
                .estado(ESTADO_VIGENTE)
                .observacion(observacion)
                .build();
        control = controlPlazoRepository.save(control);

        log.info("Plazo iniciado: expediente={}, regla={}, fechaBase={}, fechaLimite={}, dias={}",
                idExpediente, codigoRegla, fechaBase, fechaLimite, regla.getDiasPlazo());
        return toDTO(control);
    }

    @Override
    public ControlPlazoDTO registrarCumplimiento(Long idExpediente, String codigoRegla,
                                                   LocalDate fechaCumplimiento) {
        ReglaPlazo regla = reglaPlazoRepository.findByCodigoAndActivoTrue(codigoRegla)
                .orElseThrow(() -> new ResourceNotFoundException("Regla de plazo no encontrada: " + codigoRegla));

        Optional<ControlPlazo> activoOpt = controlPlazoRepository
                .findTopByExpedienteIdAndReglaPlazoCodigoAndEstadoInOrderByFechaCreacionDesc(
                        idExpediente, codigoRegla,
                        List.of(ESTADO_VIGENTE, ESTADO_PROXIMO_VENCER, ESTADO_VENCIDO));

        if (activoOpt.isEmpty()) {
            log.warn("No hay plazo activo para expediente {} regla {}",
                    idExpediente, codigoRegla);
        }

        ControlPlazo control = activoOpt.orElse(null);
        if (control == null) {
            return null;
        }

        boolean dentroPlazo = !fechaCumplimiento.isAfter(control.getFechaLimite());
        control.setEstado(dentroPlazo ? ESTADO_CUMPLIDO_PLAZO : ESTADO_CUMPLIDO_FUERA);
        control.setFechaCumplimiento(fechaCumplimiento.atStartOfDay());
        control.setCumplidoEnPlazo(dentroPlazo);
        control = controlPlazoRepository.save(control);

        log.info("Plazo {} para expediente {}: {} (fechaCumplimiento={}, fechaLimite={})",
                dentroPlazo ? "CUMPLIDO_EN_PLAZO" : "CUMPLIDO_FUERA_PLAZO",
                idExpediente, fechaCumplimiento, control.getFechaLimite());

        return toDTO(control);
    }

    @Override
    public void validarEntregaOPresentacion(Long idExpediente, String codigoRegla) {
        ReglaPlazo regla = reglaPlazoRepository.findByCodigoAndActivoTrue(codigoRegla)
                .orElseThrow(() -> new ResourceNotFoundException("Regla de plazo no encontrada: " + codigoRegla));

        Optional<ControlPlazo> activoOpt = controlPlazoRepository
                .findTopByExpedienteIdAndReglaPlazoCodigoAndEstadoInOrderByFechaCreacionDesc(
                        idExpediente, codigoRegla,
                        List.of(ESTADO_VIGENTE, ESTADO_PROXIMO_VENCER, ESTADO_VENCIDO));

        if (activoOpt.isEmpty()) {
            List<ControlPlazo> todos = controlPlazoRepository
                    .findByExpedienteIdWithRegla(idExpediente);
            boolean yaCumplido = todos.stream()
                    .anyMatch(c -> c.getReglaPlazo().getCodigo().equals(codigoRegla)
                            && (ESTADO_CUMPLIDO_PLAZO.equals(c.getEstado())
                                || ESTADO_CUMPLIDO_FUERA.equals(c.getEstado())));
            if (yaCumplido) {
                log.warn("El plazo {} ya fue cumplido previamente para expediente {}", codigoRegla, idExpediente);
                return;
            }
            log.warn("No hay plazo activo para {} expediente {} - se omite validación",
                    codigoRegla, idExpediente);
            return;
        }

        ControlPlazo control = activoOpt.get();

        if (ESTADO_VENCIDO.equals(control.getEstado())) {
            throw new BusinessException(String.format(
                    "El plazo para '%s' ha vencido. Fecha límite era %s. " +
                    "No es posible realizar esta acción fuera del plazo normativo.",
                    regla.getNombre(), control.getFechaLimite()));
        }

        if (LocalDate.now().isAfter(control.getFechaLimite())) {
            control.setEstado(ESTADO_VENCIDO);
            controlPlazoRepository.save(control);
            throw new BusinessException(String.format(
                    "El plazo para '%s' ha vencido (fecha límite: %s). " +
                    "La acción debe realizarse dentro del plazo normativo.",
                    regla.getNombre(), control.getFechaLimite()));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ControlPlazoDTO consultarEstado(Long idExpediente, String codigoRegla) {
        return controlPlazoRepository
                .findByExpedienteAndReglaCodigoWithEstados(idExpediente, codigoRegla,
                        List.of(ESTADO_VIGENTE, ESTADO_PROXIMO_VENCER, ESTADO_VENCIDO,
                                ESTADO_CUMPLIDO_PLAZO, ESTADO_CUMPLIDO_FUERA))
                .stream()
                .findFirst()
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ControlPlazoDTO> listarPlazosPorExpediente(Long idExpediente) {
        return controlPlazoRepository.findByExpedienteIdWithRegla(idExpediente).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ControlPlazoDTO> listarPlazosVigentes() {
        return controlPlazoRepository.findAllVigentes().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ControlPlazoDTO> listarPlazosVencidosOPorroVencer() {
        List<ControlPlazo> todos = controlPlazoRepository.findAllVigentes();
        List<ControlPlazo> resultado = new ArrayList<>();
        LocalDate hoy = LocalDate.now();
        for (ControlPlazo c : todos) {
            if (c.getFechaLimite().isBefore(hoy) || c.getFechaLimite().minusDays(
                    c.getReglaPlazo().getDiasProximoVencer() != null
                            ? c.getReglaPlazo().getDiasProximoVencer() : 3).isBefore(hoy)) {
                resultado.add(c);
            }
        }
        return resultado.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public int actualizarEstadosVencidos() {
        LocalDate hoy = LocalDate.now();
        List<ControlPlazo> vigentes = controlPlazoRepository.findVigentesConFechaLimiteAntesDe(hoy);
        int contador = 0;
        for (ControlPlazo c : vigentes) {
            c.setEstado(ESTADO_VENCIDO);
            controlPlazoRepository.save(c);
            contador++;
        }

        List<ControlPlazo> proximosAVencer = controlPlazoRepository.findAllVigentes().stream()
                .filter(c -> ESTADO_VIGENTE.equals(c.getEstado()))
                .filter(c -> {
                    int umbral = c.getReglaPlazo().getDiasProximoVencer() != null
                            ? c.getReglaPlazo().getDiasProximoVencer() : 3;
                    return !c.getFechaLimite().isBefore(hoy)
                            && c.getFechaLimite().minusDays(umbral).isBefore(hoy);
                })
                .collect(Collectors.toList());

        for (ControlPlazo c : proximosAVencer) {
            c.setEstado(ESTADO_PROXIMO_VENCER);
            controlPlazoRepository.save(c);
            contador++;
        }

        if (contador > 0) {
            log.info("Estados de plazo actualizados: {} registros modificados", contador);
        }
        return contador;
    }

    @Override
    public ControlPlazoDTO cancelarPlazoVigente(Long idExpediente, String codigoRegla, String observacion) {
        List<ControlPlazo> activos = controlPlazoRepository
                .findByExpedienteAndReglaCodigoWithEstados(idExpediente, codigoRegla,
                        List.of(ESTADO_VIGENTE, ESTADO_PROXIMO_VENCER));

        if (activos.isEmpty()) {
            return null;
        }

        ControlPlazo control = activos.get(0);
        control.setEstado(ESTADO_INACTIVO);
        control.setObservacion(observacion);
        control = controlPlazoRepository.save(control);

        log.info("Plazo cancelado: expediente={}, regla={}, motivo={}", idExpediente, codigoRegla, observacion);
        return toDTO(control);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReglaPlazoDTO> listarReglas() {
        return reglaPlazoRepository.findByActivoTrueOrderByOrdenAsc().stream()
                .map(this::toReglaDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReglaPlazoDTO> listarReglasPorTipoPractica(String codigoTipoPractica) {
        return reglaPlazoRepository
                .findByTipoPracticaCodigoAndActivoTrueOrderByOrdenAsc(codigoTipoPractica).stream()
                .map(this::toReglaDTO)
                .collect(Collectors.toList());
    }

    private LocalDate calcularFechaLimite(LocalDate fechaBase, int dias) {
        return fechaBase.plusDays(dias);
    }

    private ControlPlazoDTO toDTO(ControlPlazo c) {
        LocalDate hoy = LocalDate.now();
        boolean vencidoReal = c.getFechaLimite().isBefore(hoy)
                && List.of(ESTADO_VIGENTE, ESTADO_PROXIMO_VENCER).contains(c.getEstado());

        if (vencidoReal && !ESTADO_VENCIDO.equals(c.getEstado())) {
        }

        long diasRestantes = ChronoUnit.DAYS.between(hoy, c.getFechaLimite());
        long diasTranscurridos = ChronoUnit.DAYS.between(c.getFechaBase(), hoy);

        return ControlPlazoDTO.builder()
                .id(c.getId())
                .idExpediente(c.getExpediente().getId())
                .codigoExpediente(c.getExpediente().getCodigoExpediente())
                .idReglaPlazo(c.getReglaPlazo().getId())
                .codigoRegla(c.getReglaPlazo().getCodigo())
                .nombreRegla(c.getReglaPlazo().getNombre())
                .idPlan(c.getIdPlan())
                .idDocumento(c.getIdDocumento())
                .fechaBase(c.getFechaBase())
                .fechaLimite(c.getFechaLimite())
                .fechaCumplimiento(c.getFechaCumplimiento())
                .estado(vencidoReal ? ESTADO_VENCIDO : c.getEstado())
                .cumplidoEnPlazo(c.getCumplidoEnPlazo())
                .observacion(c.getObservacion())
                .diasRestantes(diasRestantes)
                .diasTranscurridos(diasTranscurridos)
                .fechaCreacion(c.getFechaCreacion())
                .build();
    }

    private ReglaPlazoDTO toReglaDTO(ReglaPlazo r) {
        return ReglaPlazoDTO.builder()
                .id(r.getId())
                .codigo(r.getCodigo())
                .idTipoPractica(r.getTipoPractica() != null ? r.getTipoPractica().getId() : null)
                .codigoTipoPractica(r.getTipoPractica() != null ? r.getTipoPractica().getCodigo() : null)
                .nombre(r.getNombre())
                .descripcion(r.getDescripcion())
                .etapaExpediente(r.getEtapaExpediente())
                .diasPlazo(r.getDiasPlazo())
                .tipoComputo(r.getTipoComputo())
                .orden(r.getOrden())
                .activo(r.getActivo())
                .diasProximoVencer(r.getDiasProximoVencer())
                .build();
    }
}
