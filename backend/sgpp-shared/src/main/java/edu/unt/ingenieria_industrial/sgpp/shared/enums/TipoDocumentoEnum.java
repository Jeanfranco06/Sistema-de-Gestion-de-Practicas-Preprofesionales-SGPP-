package edu.unt.ingenieria_industrial.sgpp.shared.enums;

public enum TipoDocumentoEnum {
    // Documentos institucionales normativa UNT 2025
    SOLICITUD_PRACTICA("Solicitud de práctica"),
    CARTA_PRESENTACION("Carta de presentación"),
    CARTA_ACEPTACION("Carta de aceptación"),
    PLAN_PRACTICA("Plan de prácticas"),
    FICHA_EVALUACION("Ficha de evaluación (Anexo 2)"),
    CONSTANCIA_EMPRESA("Constancia de la empresa"),
    INFORME_PARCIAL_1("Informe parcial 1"),
    INFORME_PARCIAL_2("Informe parcial 2"),
    INFORME_FINAL_INICIAL("Informe final - práctica inicial"),
    INFORME_FINAL("Informe final"),
    INFORME_FINAL_PROFESIONAL("Informe final - práctica profesional"),
    DICTAMEN_FINAL("Dictamen final"),
    CONSTANCIA_CULMINACION("Constancia de culminación"),

    // Legacy / compatibilidad
    CONVENIO("Convenio marco"),
    CARTA_COMPROMISO("Carta de compromiso"),
    PLAN_ACTIVIDADES("Plan de actividades"),
    INFORME_PARCIAL("Informe parcial"),
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
