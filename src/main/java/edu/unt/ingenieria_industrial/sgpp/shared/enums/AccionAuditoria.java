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
    EXPORT("Exportar");

    private final String descripcion;

    AccionAuditoria(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
