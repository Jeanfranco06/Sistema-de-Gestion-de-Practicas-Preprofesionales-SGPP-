package edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoRenderizable {

    @Builder.Default
    private MetadatosDocumento metadatos = new MetadatosDocumento();

    @Builder.Default
    private List<SeccionDocumento> secciones = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetadatosDocumento {
        private String titulo;
        private String subtitulo;
        private String institucion;
        private String unidadAcademica;
        private String tipoDocumento;
        private String tipoReporte;
        private String periodoConsultado;
        private String filtrosDescripcion;
        private String generadoPor;
        private LocalDateTime fechaGeneracion;
        private String codigoTrazabilidad;
        private String logoIzquierdaPath;
        private String logoDerechaPath;
        private String marcaDeAguaPath;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeccionDocumento {
        private String titulo;
        private TipoSeccion tipo;
        private String contenidoTexto;
        @Builder.Default
        private List<String> encabezados = new ArrayList<>();
        @Builder.Default
        private List<List<String>> filas = new ArrayList<>();
        @Builder.Default
        private Map<String, String> campos = new LinkedHashMap<>();
        @Builder.Default
        private Alineacion alineacion = Alineacion.IZQUIERDA;
    }

    public enum Alineacion {
        IZQUIERDA,
        CENTRO,
        DERECHA,
        JUSTIFICADO
    }

    public enum TipoSeccion {
        TEXTO,
        CAMPOS,
        TABLA
    }
}
