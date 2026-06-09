package edu.unt.ingenieria_industrial.sgpp.core.academico.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.academico.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.academico.model.*;
import edu.unt.ingenieria_industrial.sgpp.core.academico.repository.*;
import edu.unt.ingenieria_industrial.sgpp.core.academico.service.ValidacionAcademicaService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.Practica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.PracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.EstadoAcademico;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ValidacionAcademicaServiceImpl implements ValidacionAcademicaService {

    private final EstudianteRepository estudianteRepository;
    private final TipoPracticaRepository tipoPracticaRepository;
    private final PracticaRepository practicaRepository;
    private final NormaValidacionRepository normaRepository;
    private final ReglaValidacionRepository reglaRepository;
    private final ParametroReglaRepository parametroRepository;
    private final ResultadoValidacionRepository resultadoRepository;
    private final DetalleValidacionRepository detalleRepository;

    private static final String NORMA_REGLAMENTO_II = "REGLAMENTO_II";
    private static final String NORMA_LINEAMIENTOS_UNT_2025 = "LINEAMIENTOS_UNT_2025";

    @Override
    @Transactional
    public ValidacionAcademicaResponse validarEstudiante(ValidacionAcademicaRequest request) {
        Estudiante estudiante = estudianteRepository.findById(request.getEstudianteId())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante", "id", request.getEstudianteId()));

        TipoPractica tipoPractica = tipoPracticaRepository.findByCodigo(request.getCodigoTipoPractica())
                .orElseThrow(() -> new BusinessException(
                        "Tipo de práctica no encontrado: " + request.getCodigoTipoPractica()));

        List<NormaValidacion> normasAplicables = determinarNormasAplicables(estudiante, tipoPractica);

        if (normasAplicables.isEmpty()) {
            throw new BusinessException(
                    "No hay normas de validación vigentes para " + tipoPractica.getNombre());
        }

        List<ReglaValidacion> reglas = new ArrayList<>();
        NormaValidacion normaPrincipal = normasAplicables.get(0);

        for (NormaValidacion norma : normasAplicables) {
            List<ReglaValidacion> reglasNorma = reglaRepository
                    .findByTipoPracticaCodigoAndNormaCodigoAndActivoTrueOrderByOrdenAsc(
                            request.getCodigoTipoPractica(), norma.getCodigo());
            reglas.addAll(reglasNorma);
        }

        if (reglas.isEmpty()) {
            throw new BusinessException(
                    "No hay reglas de validación configuradas para " + tipoPractica.getNombre());
        }

        List<DetalleValidacionDTO> detalles = new ArrayList<>();
        boolean habilitado = true;
        List<String> observaciones = new ArrayList<>();

        for (ReglaValidacion regla : reglas) {
            List<ParametroRegla> parametros = parametroRepository
                    .findByReglaValidacionIdAndActivoTrue(regla.getId());

            boolean cumplido = evaluarRegla(estudiante, regla, parametros);

            String obsRegla = generarObservacion(regla, cumplido);
            if (!cumplido) {
                observaciones.add(obsRegla);
                if (regla.getObligatorio()) {
                    habilitado = false;
                }
            }

            detalles.add(DetalleValidacionDTO.builder()
                    .codigoRegla(regla.getCodigo())
                    .nombreRegla(regla.getNombre())
                    .descripcion(regla.getDescripcion())
                    .obligatorio(regla.getObligatorio())
                    .cumplido(cumplido)
                    .observaciones(obsRegla)
                    .orden(regla.getOrden())
                    .build());
        }

        String observacionesGenerales = observaciones.isEmpty()
                ? "El estudiante cumple con todos los requisitos académicos para " + tipoPractica.getNombre()
                : "El estudiante no cumple con los siguientes requisitos: " + String.join("; ", observaciones);

        if (habilitado && !observaciones.isEmpty()) {
            observacionesGenerales = "El estudiante cumple los requisitos obligatorios, pero presenta observaciones en reglas no obligatorias: "
                    + String.join("; ", observaciones);
        }

        String periodo = request.getPeriodoAcademico() != null
                ? request.getPeriodoAcademico()
                : String.valueOf(LocalDate.now().getYear());

        ResultadoValidacion resultado = ResultadoValidacion.builder()
                .estudiante(estudiante)
                .tipoPractica(tipoPractica)
                .norma(normaPrincipal)
                .habilitado(habilitado)
                .periodoAcademico(periodo)
                .fechaValidacion(LocalDateTime.now())
                .observacionesGenerales(observacionesGenerales)
                .build();

        resultado = resultadoRepository.save(resultado);

        int orden = 0;
        for (DetalleValidacionDTO detalleDTO : detalles) {
            ReglaValidacion regla = reglas.get(orden);

            DetalleValidacion detalle = DetalleValidacion.builder()
                    .resultadoValidacion(resultado)
                    .reglaValidacion(regla)
                    .cumplido(detalleDTO.getCumplido())
                    .observaciones(detalleDTO.getObservaciones())
                    .orden(orden)
                    .build();

            detalleRepository.save(detalle);
            orden++;
        }

        return buildResponse(resultado, detalles);
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionAcademicaResponse obtenerResultadoPorId(Long id) {
        ResultadoValidacion resultado = resultadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ResultadoValidacion", "id", id));

        List<DetalleValidacion> detalles = detalleRepository
                .findByResultadoValidacionIdOrderByOrdenAsc(id);

        return buildResponse(resultado, detalles.stream()
                .map(this::toDetalleDTO)
                .collect(Collectors.toList()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ValidacionAcademicaResponse> listarResultadosPorEstudiante(Long estudianteId) {
        List<ResultadoValidacion> resultados = resultadoRepository
                .findByEstudianteIdOrderByFechaValidacionDesc(estudianteId);

        return resultados.stream()
                .map(r -> {
                    List<DetalleValidacion> detalles = detalleRepository
                            .findByResultadoValidacionIdOrderByOrdenAsc(r.getId());
                    return buildResponse(r, detalles.stream()
                            .map(this::toDetalleDTO)
                            .collect(Collectors.toList()));
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ValidacionAcademicaResponse obtenerUltimoResultado(Long estudianteId, String codigoTipoPractica) {
        TipoPractica tipoPractica = tipoPracticaRepository.findByCodigo(codigoTipoPractica)
                .orElseThrow(() -> new BusinessException("Tipo de práctica no encontrado: " + codigoTipoPractica));

        ResultadoValidacion resultado = resultadoRepository
                .findTopByEstudianteIdAndTipoPracticaIdAndActivoTrueOrderByFechaValidacionDesc(
                        estudianteId, tipoPractica.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ResultadoValidacion", "estudianteId/tipoPracticaId",
                        estudianteId + "/" + codigoTipoPractica));

        List<DetalleValidacion> detalles = detalleRepository
                .findByResultadoValidacionIdOrderByOrdenAsc(resultado.getId());

        return buildResponse(resultado, detalles.stream()
                .map(this::toDetalleDTO)
                .collect(Collectors.toList()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReglaValidacionDTO> listarReglasPorTipoPractica(String codigoTipoPractica) {
        return reglaRepository.findByTipoPracticaCodigoAndActivoTrueOrderByOrdenAsc(codigoTipoPractica)
                .stream()
                .map(r -> ReglaValidacionDTO.builder()
                        .id(r.getId())
                        .codigo(r.getCodigo())
                        .nombre(r.getNombre())
                        .descripcion(r.getDescripcion())
                        .obligatorio(r.getObligatorio())
                        .orden(r.getOrden())
                        .idNorma(r.getNorma().getId())
                        .nombreNorma(r.getNorma().getNombre())
                        .codigoNorma(r.getNorma().getCodigo())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NormaValidacionDTO> listarNormasActivas() {
        return normaRepository.findByActivoTrue().stream()
                .map(n -> NormaValidacionDTO.builder()
                        .id(n.getId())
                        .codigo(n.getCodigo())
                        .nombre(n.getNombre())
                        .descripcion(n.getDescripcion())
                        .fechaVigenciaInicio(n.getFechaVigenciaInicio())
                        .fechaVigenciaFin(n.getFechaVigenciaFin())
                        .activo(n.getActivo())
                        .build())
                .collect(Collectors.toList());
    }

    private List<NormaValidacion> determinarNormasAplicables(Estudiante estudiante, TipoPractica tipoPractica) {
        LocalDate hoy = LocalDate.now();
        List<NormaValidacion> vigentes = normaRepository
                .findByActivoTrueAndFechaVigenciaInicioLessThanEqualAndFechaVigenciaFinIsNullOrFechaVigenciaFinGreaterThanEqual(
                        hoy, hoy);

        if (vigentes.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, NormaValidacion> mapa = vigentes.stream()
                .collect(Collectors.toMap(NormaValidacion::getCodigo, n -> n));

        List<NormaValidacion> aplicables = new ArrayList<>();
        if (mapa.containsKey(NORMA_REGLAMENTO_II)) {
            aplicables.add(mapa.get(NORMA_REGLAMENTO_II));
        }
        if (mapa.containsKey(NORMA_LINEAMIENTOS_UNT_2025)) {
            aplicables.add(mapa.get(NORMA_LINEAMIENTOS_UNT_2025));
        }

        return aplicables;
    }

    private boolean evaluarRegla(Estudiante estudiante, ReglaValidacion regla,
                                  List<ParametroRegla> parametros) {
        switch (regla.getCodigo()) {
            case "MATRICULA_ACTIVA":
                return evaluarMatriculaActiva(estudiante);
            case "PRERREQUISITOS_APROBADOS":
                return evaluarPrerrequisitos(estudiante, parametros);
            case "PPI_APROBADAS":
                return evaluarPPIAprobadas(estudiante);
            case "CURSOS_HASTA_OCTAVO":
                return evaluarSemestreMinimo(estudiante, parametros, 8);
            case "CURSOS_HASTA_NOVENO":
                return evaluarSemestreMinimo(estudiante, parametros, 9);
            case "CREDITOS_MINIMOS":
                return evaluarCreditosMinimos(estudiante, parametros);
            default:
                throw new BusinessException("Regla de validación no implementada: " + regla.getCodigo());
        }
    }

    private boolean evaluarMatriculaActiva(Estudiante estudiante) {
        return estudiante.getEstadoAcademico() != null
                && (EstadoAcademico.MATRICULADO.equals(estudiante.getEstadoAcademico())
                    || EstadoAcademico.ACTIVO.equals(estudiante.getEstadoAcademico()));
    }

    private boolean evaluarPrerrequisitos(Estudiante estudiante, List<ParametroRegla> parametros) {
        Optional<String> optCreditos = buscarParametro(parametros, "CREDITOS_MINIMOS");
        int creditosMinimos = optCreditos.map(Integer::parseInt).orElse(0);

        return estudiante.getCreditosAprobados() != null
                && estudiante.getCreditosAprobados() >= creditosMinimos;
    }

    private boolean evaluarPPIAprobadas(Estudiante estudiante) {
        List<Practica> practicas = practicaRepository.findByEstudianteId(estudiante.getId());
        if (practicas.isEmpty()) {
            return false;
        }

        TipoPractica tipoInicial = tipoPracticaRepository.findByCodigo("INICIAL").orElse(null);
        if (tipoInicial == null) {
            return false;
        }

        return practicas.stream()
                .filter(p -> p.getActivo())
                .filter(p -> p.getTipoPractica() != null)
                .anyMatch(p -> p.getTipoPractica().getId().equals(tipoInicial.getId())
                        && p.getEstado() != null
                        && "COMPLETADA".equals(p.getEstado().getCodigo()));
    }

    private boolean evaluarSemestreMinimo(Estudiante estudiante, List<ParametroRegla> parametros,
                                           int semestreDefault) {
        Optional<String> optSemestre = buscarParametro(parametros, "SEMESTRE_MINIMO");
        int semestreMinimo = optSemestre.map(Integer::parseInt).orElse(semestreDefault);

        return estudiante.getSemestreActual() != null
                && estudiante.getSemestreActual() >= semestreMinimo;
    }

    private boolean evaluarCreditosMinimos(Estudiante estudiante, List<ParametroRegla> parametros) {
        Optional<String> optCreditos = buscarParametro(parametros, "CREDITOS_MINIMOS");
        int creditosMinimos = optCreditos.map(Integer::parseInt).orElse(0);

        return estudiante.getCreditosAprobados() != null
                && estudiante.getCreditosAprobados() >= creditosMinimos;
    }

    private Optional<String> buscarParametro(List<ParametroRegla> parametros, String clave) {
        return parametros.stream()
                .filter(p -> p.getClave().equals(clave))
                .map(ParametroRegla::getValor)
                .findFirst();
    }

    private String generarObservacion(ReglaValidacion regla, boolean cumplido) {
        if (cumplido) {
            return "OK: " + regla.getNombre();
        }
        return "INCUMPLE: " + regla.getNombre()
                + (regla.getDescripcion() != null ? " — " + regla.getDescripcion() : "");
    }

    private ValidacionAcademicaResponse buildResponse(ResultadoValidacion resultado,
                                                       List<DetalleValidacionDTO> detalles) {
        int cumplidas = (int) detalles.stream().filter(DetalleValidacionDTO::getCumplido).count();
        int total = detalles.size();

        return ValidacionAcademicaResponse.builder()
                .idResultado(resultado.getId())
                .estudianteId(resultado.getEstudiante().getId())
                .nombreEstudiante(resultado.getEstudiante().getUsuario().getNombres()
                        + " " + resultado.getEstudiante().getUsuario().getApellidoPaterno())
                .codigoEstudiantil(resultado.getEstudiante().getCodigoEstudiantil())
                .tipoPractica(resultado.getTipoPractica().getNombre())
                .normaAplicada(resultado.getNorma().getNombre())
                .periodoAcademico(resultado.getPeriodoAcademico())
                .habilitado(resultado.getHabilitado())
                .fechaValidacion(resultado.getFechaValidacion())
                .detalles(detalles)
                .observacionesGenerales(resultado.getObservacionesGenerales())
                .reglasCumplidas(cumplidas)
                .reglasIncumplidas(total - cumplidas)
                .totalReglas(total)
                .build();
    }

    private DetalleValidacionDTO toDetalleDTO(DetalleValidacion detalle) {
        return DetalleValidacionDTO.builder()
                .codigoRegla(detalle.getReglaValidacion().getCodigo())
                .nombreRegla(detalle.getReglaValidacion().getNombre())
                .descripcion(detalle.getReglaValidacion().getDescripcion())
                .obligatorio(detalle.getReglaValidacion().getObligatorio())
                .cumplido(detalle.getCumplido())
                .observaciones(detalle.getObservaciones())
                .orden(detalle.getOrden())
                .build();
    }
}
