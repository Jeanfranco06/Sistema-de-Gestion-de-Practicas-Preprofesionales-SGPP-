package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.ComponenteEvaluacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.ComponenteEvaluacion;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository.ComponenteEvaluacionRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComponenteEvaluacionServiceImplTest {

    @Mock
    private ComponenteEvaluacionRepository componenteRepository;

    @Mock
    private ExpedienteRepository expedienteRepository;

    @InjectMocks
    private ComponenteEvaluacionServiceImpl service;

    @Test
    void noInicializaComponentesParaPracticaInicial() {
        Expediente expediente = new Expediente();
        expediente.setId(1L);
        when(expedienteRepository.findById(1L)).thenReturn(Optional.of(expediente));

        service.inicializarComponentes(1L, "INICIAL");

        verify(componenteRepository, never()).saveAll(any());
    }

    @Test
    void inicializaTresComponentesParaPracticaFinal() {
        Expediente expediente = new Expediente();
        expediente.setId(1L);
        when(expedienteRepository.findById(1L)).thenReturn(Optional.of(expediente));
        when(componenteRepository.findByExpedienteIdAndActivoTrue(1L)).thenReturn(List.of());

        service.inicializarComponentes(1L, "FINAL");

        ArgumentCaptor<List<ComponenteEvaluacion>> captor = ArgumentCaptor.forClass(List.class);
        verify(componenteRepository).saveAll(captor.capture());
        List<ComponenteEvaluacion> componentes = captor.getValue();
        assertThat(componentes).hasSize(3);
        assertThat(componentes).extracting(ComponenteEvaluacion::getTipoComponente)
                .containsExactlyInAnyOrder("PLAN", "EMPRESA", "INFORME");
    }

    @Test
    void registraEvaluacionYSincronizaCalificacionFinal() {
        Expediente expediente = new Expediente();
        expediente.setId(1L);
        ComponenteEvaluacion plan = ComponenteEvaluacion.builder()
                .expediente(expediente)
                .tipoComponente("PLAN")
                .puntajeMaximo(10)
                .estado("PENDIENTE")
                .activo(true)
                .build();
        ComponenteEvaluacion empresa = ComponenteEvaluacion.builder()
                .expediente(expediente)
                .tipoComponente("EMPRESA")
                .puntajeMaximo(50)
                .puntajeObtenido(40)
                .estado("COMPLETADO")
                .activo(true)
                .build();
        ComponenteEvaluacion informe = ComponenteEvaluacion.builder()
                .expediente(expediente)
                .tipoComponente("INFORME")
                .puntajeMaximo(40)
                .puntajeObtenido(30)
                .estado("COMPLETADO")
                .activo(true)
                .build();

        when(componenteRepository.findByExpedienteIdAndTipoComponenteAndActivoTrue(1L, "PLAN"))
                .thenReturn(Optional.of(plan));
        when(componenteRepository.findByExpedienteIdAndActivoTrue(1L))
                .thenReturn(List.of(plan, empresa, informe));
        when(expedienteRepository.findById(1L)).thenReturn(Optional.of(expediente));
        when(componenteRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ComponenteEvaluacionDTO dto = service.registrarEvaluacion(1L, "PLAN", 8, 5L, "DOCENTE_ASESOR", "Bien");

        assertThat(dto.getPuntajeObtenido()).isEqualTo(8);
        assertThat(dto.getEstado()).isEqualTo("COMPLETADO");
        assertThat(expediente.getCalificacionFinal()).isEqualTo(new BigDecimal("15.60"));
    }

    @Test
    void calcularPuntajeTotalSumaComponentesCompletados() {
        ComponenteEvaluacion c1 = ComponenteEvaluacion.builder()
                .tipoComponente("PLAN").puntajeObtenido(10).estado("COMPLETADO").activo(true).build();
        ComponenteEvaluacion c2 = ComponenteEvaluacion.builder()
                .tipoComponente("EMPRESA").puntajeObtenido(40).estado("COMPLETADO").activo(true).build();
        when(componenteRepository.findByExpedienteIdAndActivoTrue(1L)).thenReturn(List.of(c1, c2));

        Integer total = service.calcularPuntajeTotal(1L);

        assertThat(total).isEqualTo(50);
    }
}
