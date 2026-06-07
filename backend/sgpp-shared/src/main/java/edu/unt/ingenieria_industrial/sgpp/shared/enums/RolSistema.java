package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum RolSistema {
    ESTUDIANTE("Estudiante"),
    DOCENTE_ASESOR("Docente Asesor"),
    TUTOR_EXTERNO("Tutor Externo"),
    SECRETARIA("Secretaría"),
    COMITE_PRACTICAS("Comité de Prácticas"),
    COORDINADOR("Coordinador"),
    DIRECTOR("Director"),
    ADMINISTRADOR("Administrador");

    private final String descripcion;

    RolSistema(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
