package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum AccionAuditoria {
    CREATE("Crear"),
    UPDATE("Actualizar"),
    DELETE("Eliminar"),
    LOGIN("Iniciar Sesión"),
    LOGOUT("Cerrar Sesión"),
    APPROVE("Aprobar"),
    REJECT("Rechazar"),
    VIEW("Ver"),
    EXPORT("Exportar"),
    OBSERVAR("Observar"),
    SUBSANAR("Subsanar"),
    VALIDAR("Validar"),
    CERRAR("Cerrar trámite"),
    REABRIR("Reabrir trámite"),
    ANULAR("Anular"),
    EMITIR("Emitir"),
    CAMBIO_ESTADO("Cambio de estado"),
    GENERAR_DOCUMENTO("Generar documento"),
    REGISTRAR_CALIFICACION("Registrar calificación"),
    PLAZO_CUMPLIDO("Plazo cumplido"),
    PLAZO_VENCIDO("Plazo vencido"),
    DESHABILITAR("Deshabilitar");

    private final String descripcion;

    AccionAuditoria(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    /**
     * Resuelve la etiqueta en español a partir del código almacenado (incluye códigos legacy en inglés).
     */
    public static String resolverDescripcion(String codigoAccion) {
        if (codigoAccion == null) return null;
        try {
            return AccionAuditoria.valueOf(codigoAccion).getDescripcion();
        } catch (IllegalArgumentException ex) {
            return switch (codigoAccion) {
                case "OBSERVE" -> OBSERVAR.descripcion;
                case "SUBSANATE" -> SUBSANAR.descripcion;
                case "VALIDATE" -> VALIDAR.descripcion;
                case "CLOSE" -> CERRAR.descripcion;
                case "REOPEN" -> REABRIR.descripcion;
                case "CANCEL" -> ANULAR.descripcion;
                case "EMIT" -> EMITIR.descripcion;
                case "STATE_CHANGE" -> CAMBIO_ESTADO.descripcion;
                case "GENERATE_DOC" -> GENERAR_DOCUMENTO.descripcion;
                case "REGISTER_GRADE" -> REGISTRAR_CALIFICACION.descripcion;
                case "DISABLE" -> DESHABILITAR.descripcion;
                default -> codigoAccion;
            };
        }
    }
}
