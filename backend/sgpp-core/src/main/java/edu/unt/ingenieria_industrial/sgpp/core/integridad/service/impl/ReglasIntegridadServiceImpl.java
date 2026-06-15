package edu.unt.ingenieria_industrial.sgpp.core.integridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.ConvenioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.EmpresaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.hora.service.ControlHoraService;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.service.ReglasIntegridadService;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.service.PlazoService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReglasIntegridadServiceImpl implements ReglasIntegridadService {

    private static final String TIPO_INICIAL = "INICIAL";
    private static final BigDecimal NOTA_MINIMA_APROBACION = new BigDecimal("13.5");

    private static final Set<String> ESTADOS_PERMITIDOS_CALIFICACION = Set.of(
            "INFORME_PARCIAL_PRESENTADO", "INFORME_FINAL_PRESENTADO", "EN_EJECUCION", "EVALUADO");

    private static final Set<String> ESTADOS_PERMITIDOS_SUBSANACION = Set.of("OBSERVADO");

    private final EmpresaRepository empresaRepository;
    private final SedePracticaRepository sedePracticaRepository;
    private final ConvenioRepository convenioRepository;
    private final ControlHoraService controlHoraService;
    private final PlazoService plazoService;

    @Override
    public void validarAsignacionEmpresaSede(Expediente expediente, Long idEmpresa, Long idSede, Long idConvenio) {
        Empresa empresa = empresaRepository.findById(idEmpresa)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada"));
        if (!Boolean.TRUE.equals(empresa.getActivo()) || !Boolean.TRUE.equals(empresa.getValidado())) {
            throw new BusinessException(
                    "Integridad: la empresa receptora debe estar activa y validada institucionalmente");
        }

        SedePractica sede = sedePracticaRepository.findById(idSede)
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada"));
        if (!"ACTIVA".equals(sede.getEstadoSede())) {
            throw new BusinessException("Integridad: la sede de práctica debe estar en estado ACTIVA");
        }

        if (idConvenio != null) {
            Convenio convenio = convenioRepository.findById(idConvenio)
                    .orElseThrow(() -> new ResourceNotFoundException("Convenio no encontrado"));
            if (!Boolean.TRUE.equals(convenio.getVigente()) || convenio.getFechaFin().isBefore(LocalDate.now())) {
                throw new BusinessException(
                        "Integridad: las prácticas deben ejecutarse con convenio vigente o acuerdo preliminar válido");
            }
        } else {
            List<Convenio> vigentes = convenioRepository.findByEmpresaIdAndVigenteTrue(idEmpresa);
            boolean tieneConvenioValido = vigentes.stream()
                    .anyMatch(c -> Boolean.TRUE.equals(c.getActivo())
                            && !c.getFechaFin().isBefore(LocalDate.now()));
            if (vigentes.isEmpty() || !tieneConvenioValido) {
                throw new BusinessException(
                        "Integridad: la empresa no cuenta con convenio vigente. Asigne un convenio explícito.");
            }
        }
    }

    @Override
    public void validarCierreExpediente(Expediente expediente) {
        if ("CERRADO".equals(expediente.getEstado())) {
            throw new BusinessException("Integridad: el expediente ya está cerrado");
        }

        try {
            var response = controlHoraService.puedeCerrarExpediente(expediente.getId());
            if (!Boolean.TRUE.equals(response.getData())) {
                throw new BusinessException(
                        "Integridad: no se puede cerrar sin cumplir el requisito de horas de práctica");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Validación de horas no disponible para expediente {}: {}", expediente.getId(), e.getMessage());
        }

        if (expediente.getCalificacionFinal() == null) {
            throw new BusinessException(
                    "Integridad: cierre no permitido sin calificación final registrada y auditada");
        }
        if (expediente.getCalificacionFinal().compareTo(NOTA_MINIMA_APROBACION) < 0) {
            throw new BusinessException(
                    "Integridad: la calificación final es desaprobatoria (" + expediente.getCalificacionFinal() + ")");
        }

        Set<String> documentosSubidos = expediente.getDocumentos().stream()
                .map(d -> d.getTipoDocumento())
                .collect(Collectors.toSet());

        String tipoCodigo = expediente.getTipoPractica().getCodigo();
        List<String> obligatorios = TIPO_INICIAL.equals(tipoCodigo)
                ? Arrays.asList("PLAN_PRACTICA", "INFORME_PARCIAL", "INFORME_FINAL",
                "CONSTANCIA_CULMINACION", "VISTO_BUENO_ASESOR", "DICTAMEN_FINAL")
                : Arrays.asList("CARTA_ACEPTACION", "PLAN_PRACTICA", "INFORME_FINAL",
                "CONSTANCIA_CULMINACION", "FICHA_EVALUACION_EMPRESA", "DICTAMEN_FINAL");

        for (String doc : obligatorios) {
            if (!documentosSubidos.contains(doc)) {
                throw new BusinessException(
                        "Integridad: cierre no permitido — falta documento obligatorio " + doc);
            }
        }
    }

    @Override
    public void validarRegistroCalificacion(Expediente expediente, BigDecimal calificacion) {
        if (!ESTADOS_PERMITIDOS_CALIFICACION.contains(expediente.getEstado())) {
            throw new BusinessException(
                    "Integridad: registro de calificación no permitido en estado " + expediente.getEstado());
        }
        if (calificacion == null || calificacion.compareTo(BigDecimal.ZERO) < 0
                || calificacion.compareTo(new BigDecimal("20")) > 0) {
            throw new BusinessException("Integridad: calificación fuera del rango vigesimal permitido (0-20)");
        }
    }

    @Override
    public void validarSubsanacionPermitida(Expediente expediente, Long idUsuario) {
        if (!ESTADOS_PERMITIDOS_SUBSANACION.contains(expediente.getEstado())) {
            throw new BusinessException(
                    "Integridad: subsanación solo permitida cuando el expediente está OBSERVADO");
        }
        plazoService.validarEntregaOPresentacion(expediente.getId(), "SUBSANACION_DOCUMENTO");
    }

    @Override
    public void validarTransicionEstado(Expediente expediente, String estadoDestino) {
        if (estadoDestino == null || estadoDestino.isBlank()) {
            throw new BusinessException("Integridad: estado destino inválido");
        }
        if ("CERRADO".equals(estadoDestino)) {
            validarCierreExpediente(expediente);
        }
    }
}
