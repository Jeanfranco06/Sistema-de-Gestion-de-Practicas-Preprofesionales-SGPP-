package edu.unt.ingenieria_industrial.sgpp.core.plazo.scheduler;

import edu.unt.ingenieria_industrial.sgpp.core.plazo.service.PlazoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler encargado de actualizar diariamente los estados de los plazos normativos.
 * Marca como vencidos los controles de plazo cuya fecha límite ya pasó y detecta
 * aquellos próximos a vencer, según las reglas configuradas en el sistema.
 *
 * Frecuencia: todos los días a las 06:00 hora local.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "sgpp.scheduler.plazos.enabled", havingValue = "true", matchIfMissing = true)
public class PlazoVencimientoScheduler {

    private final PlazoService plazoService;

    @Scheduled(cron = "${sgpp.scheduler.plazos.cron:0 0 6 * * ?}")
    public void actualizarPlazosVencidos() {
        log.info("Iniciando tarea programada: actualización de plazos vencidos");
        try {
            int actualizados = plazoService.actualizarEstadosVencidos();
            log.info("Tarea programada finalizada: {} plazos actualizados", actualizados);
        } catch (Exception e) {
            log.error("Error al ejecutar la actualización de plazos vencidos", e);
        }
    }
}
