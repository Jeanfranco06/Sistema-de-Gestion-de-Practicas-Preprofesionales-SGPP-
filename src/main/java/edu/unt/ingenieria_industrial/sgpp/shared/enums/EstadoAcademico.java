package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum EstadoAcademico {
    ACTIVO("Activo"),
    SUSPENDIDO("Suspendido"),
    EGRESADO("Egresado"),
    GRADUADO("Graduado");

    private final String descripcion;

    EstadoAcademico(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
