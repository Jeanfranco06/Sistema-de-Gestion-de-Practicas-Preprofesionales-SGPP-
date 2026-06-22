package edu.unt.ingenieria_industrial.sgpp.core.reporte.domain;

import java.util.Set;

/**
 * Constantes de dominio utilizadas por el motor de reportes institucionales.
 * Los estados provienen del motor de estados del expediente (ExpedienteServiceImpl).
 */
public final class ReporteDominio {

    private ReporteDominio() {
    }

    public static final String ESTADO_CERRADO = "CERRADO";

    public static final Set<String> ESTADOS_EXPEDIENTE_ACTIVO = Set.of(
            "SOLICITADO", "EMPRESA_SEDE_ASIGNADA", "CARTA_ACEPTACION_PRESENTADA",
            "ASESOR_ASIGNADO", "COMITE_ASIGNADO", "PLAN_PRESENTADO", "EN_REVISION",
            "OBSERVADO", "SUBSANADO", "APROBADO", "EN_EJECUCION",
            "INFORME_PARCIAL_PRESENTADO", "INFORME_FINAL_PRESENTADO",
            "INFORME_FINAL_APROBADO", "EVALUADO"
    );

    public static final String VALIDACION_SEDE_APROBADA = "APROBADA";
    public static final String REGLA_PLAZO_SUBSANACION = "SUBSANACION_DOCUMENTO";
    public static final String ESTADO_PLAZO_VIGENTE = "VIGENTE";
    public static final String ESTADO_PLAZO_PROXIMO_VENCER = "PROXIMO_A_VENCER";
}
