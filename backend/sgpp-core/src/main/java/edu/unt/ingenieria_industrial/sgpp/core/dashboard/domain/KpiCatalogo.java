package edu.unt.ingenieria_industrial.sgpp.core.dashboard.domain;

import edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto.KpiMetadataDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.CodigoKpi;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoGraficoKpi;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class KpiCatalogo {

    private KpiCatalogo() {
    }

    public static KpiMetadataDTO metadata(CodigoKpi codigo) {
        LocalDateTime ahora = LocalDateTime.now();
        String fechaRef = "Fecha de cálculo: " + LocalDate.now();

        return switch (codigo) {
            case EXPEDIENTES_POR_TIPO -> KpiMetadataDTO.builder()
                    .codigo(codigo.name())
                    .nombre("Expedientes por tipo de práctica")
                    .descripcion("Segmentación institucional de expedientes según catálogo tipo_practica (INICIAL, FINAL, PROFESIONAL).")
                    .formula("COUNT(expediente) GROUP BY tipo_practica.codigo")
                    .fuenteDatos("expediente, tipo_practica")
                    .fechaReferencia(fechaRef)
                    .tipoGraficoSugerido(TipoGraficoKpi.TORTA)
                    .calculadoEn(ahora)
                    .build();
            case TIEMPOS_APROBACION -> KpiMetadataDTO.builder()
                    .codigo(codigo.name())
                    .nombre("Tiempos de aprobación")
                    .descripcion("Duración entre hitos del motor de estados hasta aprobación o resolución.")
                    .formula("DATEDIFF(fecha_cambio[estado_fin] - fecha_cambio[estado_inicio]) en expediente_estado")
                    .fuenteDatos("expediente_estado (historial de cambios)")
                    .fechaReferencia(fechaRef)
                    .tipoGraficoSugerido(TipoGraficoKpi.BARRAS)
                    .calculadoEn(ahora)
                    .build();
            case CUMPLIMIENTO_PLAZOS -> KpiMetadataDTO.builder()
                    .codigo(codigo.name())
                    .nombre("Cumplimiento de plazos normativos")
                    .descripcion("Evaluación de plazos de presentación de plan (15 días) y subsanación (7/10 días) según regla_plazo y control_plazo.")
                    .formula("tasa = CUMPLIDO_EN_PLAZO / (CUMPLIDO_EN_PLAZO + CUMPLIDO_FUERA_PLAZO + VENCIDO)")
                    .fuenteDatos("control_plazo, regla_plazo")
                    .fechaReferencia(fechaRef)
                    .tipoGraficoSugerido(TipoGraficoKpi.TARJETA)
                    .calculadoEn(ahora)
                    .build();
            case DISTRIBUCION_SEDES -> KpiMetadataDTO.builder()
                    .codigo(codigo.name())
                    .nombre("Distribución de sedes")
                    .descripcion("Reparto de expedientes entre sedes registradas, con indicador de validación vigente.")
                    .formula("COUNT(expediente) GROUP BY sede_practica.id, validacion_sede vigente")
                    .fuenteDatos("expediente, sede_practica, validacion_sede")
                    .fechaReferencia(fechaRef)
                    .tipoGraficoSugerido(TipoGraficoKpi.BARRAS)
                    .calculadoEn(ahora)
                    .build();
            case EMPRESAS_RECURRENTES -> KpiMetadataDTO.builder()
                    .codigo(codigo.name())
                    .nombre("Empresas receptoras más recurrentes")
                    .descripcion("Ranking de empresas por volumen de expedientes en el periodo filtrado.")
                    .formula("COUNT(expediente) GROUP BY empresa.id ORDER BY COUNT DESC")
                    .fuenteDatos("expediente, empresa, convenio")
                    .fechaReferencia(fechaRef)
                    .tipoGraficoSugerido(TipoGraficoKpi.BARRAS)
                    .calculadoEn(ahora)
                    .build();
            case ESTADO_OBSERVACIONES -> KpiMetadataDTO.builder()
                    .codigo(codigo.name())
                    .nombre("Estado de observaciones")
                    .descripcion("Carga operativa de observaciones pendientes, subsanadas y vencidas según flujo documental.")
                    .formula("COUNT(observacion) por subsanado, estado expediente y plazo vinculado")
                    .fuenteDatos("expediente_observacion, control_plazo, expediente.estado")
                    .fechaReferencia(fechaRef)
                    .tipoGraficoSugerido(TipoGraficoKpi.TORTA)
                    .calculadoEn(ahora)
                    .build();
        };
    }
}
