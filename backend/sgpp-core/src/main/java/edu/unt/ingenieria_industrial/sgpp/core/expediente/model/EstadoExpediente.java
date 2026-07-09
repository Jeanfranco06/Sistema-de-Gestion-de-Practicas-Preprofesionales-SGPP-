package edu.unt.ingenieria_industrial.sgpp.core.expediente.model;

import lombok.Getter;

/**
 * Estados del expediente de práctica según normativa UNT 2025 y reglamento de Ingeniería Industrial.
 * Cada estado representa una etapa específica en el ciclo de vida de una práctica preprofesional.
 * 
 * Flujo para Prácticas Iniciales:
 * SOLICITADO → EMPRESA_SEDE_ASIGNADA → VALIDADO_SECRETARIA → CARTA_PRESENTACION_EMITIDA → 
 * CARTA_ACEPTACION_PRESENTADA → ASESOR_ASIGNADO → PLAN_PRESENTADO → PLAN_EN_REVISION → 
 * PLAN_APROBADO → EN_EJECUCION → INFORME_PARCIAL_1_PRESENTADO → INFORME_PARCIAL_2_PRESENTADO → 
 * INFORME_FINAL_PRESENTADO → EVALUACION_PENDIENTE → EVALUADO → CERRADO
 * 
 * Flujo para Prácticas Finales/Profesionales:
 * SOLICITADO → EMPRESA_SEDE_ASIGNADA → VALIDADO_SECRETARIA → CARTA_PRESENTACION_EMITIDA → 
 * CARTA_ACEPTACION_PRESENTADA → COMITE_ASIGNADO → PLAN_PRESENTADO → PLAN_EN_REVISION_COMITE → 
 * PLAN_APROBADO → EN_EJECUCION → INFORME_FINAL_PRESENTADO → INFORME_EN_REVISION → 
 * INFORME_APROBADO → EVALUACION_EMPRESA_PENDIENTE → EVALUACION_COMPLETA → DICTAMEN_EMITIDO → CERRADO
 */
@Getter
public enum EstadoExpediente {
    
    // Estados iniciales
    SOLICITADO("SOLICITADO", "Solicitud de práctica creada por el estudiante"),
    EMPRESA_SEDE_ASIGNADA("EMPRESA_SEDE_ASIGNADA", "Empresa y sede asignadas al expediente"),
    VALIDADO_SECRETARIA("VALIDADO_SECRETARIA", "Expediente validado por Secretaría"),
    
    // Estados de cartas
    CARTA_PRESENTACION_EMITIDA("CARTA_PRESENTACION_EMITIDA", "Carta de presentación emitida por Dirección"),
    CARTA_ACEPTACION_PRESENTADA("CARTA_ACEPTACION_PRESENTADA", "Carta de aceptación presentada por estudiante"),
    
    // Estados de asignación
    ASESOR_ASIGNADO("ASESOR_ASIGNADO", "Docente asesor asignado (solo práctica inicial)"),
    COMITE_ASIGNADO("COMITE_ASIGNADO", "Comité de prácticas asignado (solo práctica final/profesional)"),
    
    // Estados del plan de prácticas
    PLAN_PRESENTADO("PLAN_PRESENTADO", "Plan de prácticas presentado por estudiante"),
    PLAN_EN_REVISION("PLAN_EN_REVISION", "Plan en revisión por asesor"),
    PLAN_EN_REVISION_COMITE("PLAN_EN_REVISION_COMITE", "Plan en revisión por comité"),
    PLAN_OBSERVADO("PLAN_OBSERVADO", "Plan con observaciones pendientes de subsanación"),
    PLAN_APROBADO("PLAN_APROBADO", "Plan de prácticas aprobado"),
    
    // Estado de ejecución
    EN_EJECUCION("EN_EJECUCION", "Práctica en ejecución"),
    
    // Estados de informes (prácticas iniciales)
    INFORME_PARCIAL_1_PRESENTADO("INFORME_PARCIAL_1_PRESENTADO", "Informe parcial semana 5 presentado"),
    INFORME_PARCIAL_2_PRESENTADO("INFORME_PARCIAL_2_PRESENTADO", "Informe parcial semana 10 presentado"),
    INFORME_FINAL_PRESENTADO("INFORME_FINAL_PRESENTADO", "Informe final presentado"),
    
    // Estados de informe final (prácticas finales/profesionales)
    INFORME_EN_REVISION("INFORME_EN_REVISION", "Informe final en revisión por comité"),
    INFORME_APROBADO("INFORME_APROBADO", "Informe final aprobado por comité"),
    
    // Estados de evaluación
    EVALUACION_PENDIENTE("EVALUACION_PENDIENTE", "Esperando calificaciones de evaluadores"),
    EVALUACION_EMPRESA_PENDIENTE("EVALUACION_EMPRESA_PENDIENTE", "Esperando evaluación de empresa"),
    EVALUACION_COMPLETA("EVALUACION_COMPLETA", "Todas las evaluaciones registradas"),
    DICTAMEN_EMITIDO("DICTAMEN_EMITIDO", "Dictamen final emitido por comité"),
    EVALUADO("EVALUADO", "Expediente evaluado con calificación final"),
    
    // Estados de cierre
    CERRADO("CERRADO", "Expediente cerrado y constancia emitida"),
    
    // Estados de observaciones/subsanación
    OBSERVADO("OBSERVADO", "Expediente con observaciones pendientes"),
    SUBSANADO("SUBSANADO", "Observaciones subsanadas por estudiante"),
    
    // Estados de control
    EN_REVISION("EN_REVISION", "Expediente en revisión general"),
    SUSPENDIDO("SUSPENDIDO", "Práctica suspendida temporalmente"),
    CANCELADO("CANCELADO", "Práctica cancelada");
    
    private final String codigo;
    private final String descripcion;
    
    EstadoExpediente(String codigo, String descripcion) {
        this.codigo = codigo;
        this.descripcion = descripcion;
    }
    
    /**
     * Obtiene el estado a partir de su código.
     */
    public static EstadoExpediente fromCodigo(String codigo) {
        for (EstadoExpediente estado : values()) {
            if (estado.codigo.equals(codigo)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de expediente no válido: " + codigo);
    }
    
    /**
     * Verifica si este estado es una transición válida desde el estado anterior.
     */
    public boolean esTransicionValidaDesde(EstadoExpediente estadoAnterior) {
        if (estadoAnterior == null) {
            return this == SOLICITADO;
        }
        
        // Transiciones válidas generales
        switch (this) {
            case EMPRESA_SEDE_ASIGNADA:
                return estadoAnterior == SOLICITADO;
            case VALIDADO_SECRETARIA:
                return estadoAnterior == EMPRESA_SEDE_ASIGNADA;
            case CARTA_PRESENTACION_EMITIDA:
                return estadoAnterior == VALIDADO_SECRETARIA;
            case CARTA_ACEPTACION_PRESENTADA:
                return estadoAnterior == CARTA_PRESENTACION_EMITIDA;
            case ASESOR_ASIGNADO:
                return estadoAnterior == CARTA_ACEPTACION_PRESENTADA;
            case COMITE_ASIGNADO:
                return estadoAnterior == CARTA_ACEPTACION_PRESENTADA;
            case PLAN_PRESENTADO:
                return estadoAnterior == ASESOR_ASIGNADO || estadoAnterior == COMITE_ASIGNADO;
            case PLAN_EN_REVISION:
                return estadoAnterior == PLAN_PRESENTADO;
            case PLAN_EN_REVISION_COMITE:
                return estadoAnterior == PLAN_PRESENTADO;
            case PLAN_OBSERVADO:
                return estadoAnterior == PLAN_EN_REVISION || estadoAnterior == PLAN_EN_REVISION_COMITE;
            case PLAN_APROBADO:
                return estadoAnterior == PLAN_EN_REVISION || estadoAnterior == PLAN_EN_REVISION_COMITE || estadoAnterior == SUBSANADO;
            case EN_EJECUCION:
                return estadoAnterior == PLAN_APROBADO;
            case INFORME_PARCIAL_1_PRESENTADO:
                return estadoAnterior == EN_EJECUCION;
            case INFORME_PARCIAL_2_PRESENTADO:
                return estadoAnterior == INFORME_PARCIAL_1_PRESENTADO;
            case INFORME_FINAL_PRESENTADO:
                return estadoAnterior == INFORME_PARCIAL_2_PRESENTADO || estadoAnterior == EN_EJECUCION;
            case INFORME_EN_REVISION:
                return estadoAnterior == INFORME_FINAL_PRESENTADO;
            case INFORME_APROBADO:
                return estadoAnterior == INFORME_EN_REVISION || estadoAnterior == SUBSANADO;
            case EVALUACION_PENDIENTE:
                return estadoAnterior == INFORME_FINAL_PRESENTADO;
            case EVALUACION_EMPRESA_PENDIENTE:
                return estadoAnterior == INFORME_APROBADO;
            case EVALUACION_COMPLETA:
                return estadoAnterior == EVALUACION_EMPRESA_PENDIENTE || estadoAnterior == EVALUACION_PENDIENTE;
            case DICTAMEN_EMITIDO:
                return estadoAnterior == EVALUACION_COMPLETA;
            case EVALUADO:
                return estadoAnterior == EVALUACION_COMPLETA || estadoAnterior == DICTAMEN_EMITIDO;
            case CERRADO:
                return estadoAnterior == EVALUADO || estadoAnterior == DICTAMEN_EMITIDO;
            case OBSERVADO:
                return estadoAnterior == EN_REVISION || estadoAnterior == PLAN_EN_REVISION || estadoAnterior == PLAN_EN_REVISION_COMITE;
            case SUBSANADO:
                return estadoAnterior == OBSERVADO;
            case SUSPENDIDO:
            case CANCELADO:
                return true; // Se puede suspender/cancelar desde cualquier estado
            default:
                return false;
        }
    }
    
    /**
     * Verifica si este estado es un estado final (no permite más transiciones).
     */
    public boolean esEstadoFinal() {
        return this == CERRADO || this == CANCELADO;
    }
    
    /**
     * Verifica si este estado permite que el estudiante realice acciones.
     */
    public boolean permiteAccionEstudiante() {
        return this != CERRADO && this != CANCELADO && this != SUSPENDIDO;
    }
    
    /**
     * Verifica si este estado requiere asignación de asesor (práctica inicial).
     */
    public boolean requiereAsesor() {
        return this == CARTA_ACEPTACION_PRESENTADA;
    }
    
    /**
     * Verifica si este estado requiere asignación de comité (práctica final/profesional).
     */
    public boolean requiereComite() {
        return this == CARTA_ACEPTACION_PRESENTADA;
    }
}
