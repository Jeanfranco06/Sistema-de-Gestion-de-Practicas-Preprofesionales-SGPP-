package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum TipoDocumentoEnum {
    CONVENIO("Convenio marco"),
    CARTA_COMPROMISO("Carta de compromiso"),
    PLAN_ACTIVIDADES("Plan de actividades"),
    INFORME_PARCIAL("Informe parcial"),
    INFORME_FINAL("Informe final"),
    CERTIFICADO("Certificado de culminación"),
    EVALUACION_EMPRESA("Evaluación de empresa"),
    EVALUACION_DOCENTE("Evaluación de docente"),
    CONSTANCIA("Constancia de prácticas"),
    OTRO("Otro documento");

    private final String descripcion;

    TipoDocumentoEnum(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
