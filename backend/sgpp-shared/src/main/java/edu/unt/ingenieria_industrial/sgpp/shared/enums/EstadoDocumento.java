package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum EstadoDocumento {
    PENDIENTE("Pendiente de carga"),
    CARGADO("Documento cargado"),
    REVISION("En revisión"),
    APROBADO("Documento aprobado"),
    RECHAZADO("Documento rechazado"),
    OBSERVADO("Documento con observaciones");

    private final String descripcion;

    EstadoDocumento(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
