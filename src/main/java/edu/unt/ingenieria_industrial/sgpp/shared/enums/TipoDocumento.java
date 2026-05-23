package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum TipoDocumento {
    DNI("DNI"),
    CE("Carnet de Extranjería"),
    PASAPORTE("Pasaporte"),
    CARNET_EXTRANJERIA("Carnet de Extranjería");

    private final String descripcion;

    TipoDocumento(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
