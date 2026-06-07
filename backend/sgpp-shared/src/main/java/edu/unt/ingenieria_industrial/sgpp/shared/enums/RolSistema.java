package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum RolSistema {
    ESTUDIANTE("Estudiante"),
    DOCENTE_ASESOR("Docente Asesor"),
    TUTOR_EXTERNO("Tutor Externo"),
    SECRETARIA("Secretaría"),
    COMITE_PRACTICAS("Comité de Prácticas"),
    COORDINADOR("Coordinador de Prácticas"),
    DIRECTOR("Director"),
    ADMINISTRADOR("Administrador"),
    ADMIN_SISTEMA("Administrador del Sistema");

    private final String descripcion;

    RolSistema(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
