package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.CriterioEvaluacion;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.DetalleEvaluacion;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.Evaluacion;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.CriterioEvaluacionRepository;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.DetalleEvaluacionRepository;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.EvaluacionRepository;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.RubricaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EvaluacionServiceImplTest {

    @Mock
    private EvaluacionRepository evaluacionRepository;
    @Mock
    private CriterioEvaluacionRepository criterioEvaluacionRepository;
    @Mock
    private DetalleEvaluacionRepository detalleEvaluacionRepository;
    @Mock
    private RubricaRepository rubricaRepository;
    @Mock
    private ExpedienteRepository expedienteRepository;

    @InjectMocks
    private EvaluacionServiceImpl evaluacionService;

    private Expediente expedienteMock;
    private Usuario usuarioMock;
    private Estudiante estudianteMock;

    @BeforeEach
    void setUp() {
        usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setNombres("Juan");
        usuarioMock.setApellidoPaterno("Perez");

        estudianteMock = new Estudiante();
        estudianteMock.setId(1L);
        estudianteMock.setUsuario(usuarioMock);

        expedienteMock = new Expediente();
        expedienteMock.setId(1L);
        expedienteMock.setEstudiante(estudianteMock);
    }

    @Test
    void calcularPromedioFinal_calculatesWeightedAverageCorrectly() {
        // Setup Evaluaciones (Tutor Externo, Docente Asesor)
        Evaluacion eval1 = Evaluacion.builder().expediente(expedienteMock).tipoEvaluador("TUTOR_EXTERNO").activo(true).build();
        eval1.setId(1L);
        Evaluacion eval2 = Evaluacion.builder().expediente(expedienteMock).tipoEvaluador("DOCENTE_ASESOR").activo(true).build();
        eval2.setId(2L);

        // Empresa component (30% weight) -> grade is 15 out of 20
        CriterioEvaluacion critEmpresa = CriterioEvaluacion.builder().puntajeMaximo(30).nombre("Evaluación Empresa").build();
        critEmpresa.setId(1L);
        DetalleEvaluacion detEmpresa = DetalleEvaluacion.builder().criterio(critEmpresa).puntajeObtenido(15).build();

        // Docente component (30% weight) -> grade is 18 out of 20
        CriterioEvaluacion critDocente = CriterioEvaluacion.builder().puntajeMaximo(30).nombre("Evaluación Docente").build();
        critDocente.setId(2L);
        DetalleEvaluacion detDocente = DetalleEvaluacion.builder().criterio(critDocente).puntajeObtenido(18).build();

        // Informe Final component (30% weight) -> grade is 20 out of 20
        Evaluacion eval3 = Evaluacion.builder().expediente(expedienteMock).tipoEvaluador("COMITE").activo(true).build();
        eval3.setId(3L);
        CriterioEvaluacion critInforme = CriterioEvaluacion.builder().puntajeMaximo(30).nombre("Informe Final").build();
        critInforme.setId(3L);
        DetalleEvaluacion detInforme = DetalleEvaluacion.builder().criterio(critInforme).puntajeObtenido(20).build();

        // Sustentacion component (10% weight) -> grade is 14 out of 20
        Evaluacion eval4 = Evaluacion.builder().expediente(expedienteMock).tipoEvaluador("JURADO").activo(true).build();
        eval4.setId(4L);
        CriterioEvaluacion critSust = CriterioEvaluacion.builder().puntajeMaximo(10).nombre("Sustentación").build();
        critSust.setId(4L);
        DetalleEvaluacion detSust = DetalleEvaluacion.builder().criterio(critSust).puntajeObtenido(14).build();

        when(evaluacionRepository.findById(1L)).thenReturn(Optional.of(eval1));
        when(evaluacionRepository.findByExpedienteIdAndActivoTrue(1L)).thenReturn(Arrays.asList(eval1, eval2, eval3, eval4));

        when(detalleEvaluacionRepository.findByEvaluacionId(1L)).thenReturn(Collections.singletonList(detEmpresa));
        when(detalleEvaluacionRepository.findByEvaluacionId(2L)).thenReturn(Collections.singletonList(detDocente));
        when(detalleEvaluacionRepository.findByEvaluacionId(3L)).thenReturn(Collections.singletonList(detInforme));
        when(detalleEvaluacionRepository.findByEvaluacionId(4L)).thenReturn(Collections.singletonList(detSust));

        // Execute
        EvaluacionResponseDTO result = evaluacionService.obtenerEvaluacionPorId(1L);

        // Assert
        // Expected Average: (15 * 0.3) + (18 * 0.3) + (20 * 0.3) + (14 * 0.1)
        // 4.5 + 5.4 + 6.0 + 1.4 = 17.3
        assertEquals(new BigDecimal("17.30"), result.getPromedioFinal());
        assertEquals("Muy Bueno", result.getCalificacionCualitativa());
    }
}
