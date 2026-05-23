package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum EstadoPractica {
    REGISTRADA("Práctica registrada"),
    EN_PROCESO("Práctica en proceso"),
    COMPLETADA("Práctica completada"),
    CANCELADA("Práctica cancelada"),
    SUSPENDIDA("Práctica suspendida");

    private final String descripcion;

    EstadoPractica(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
