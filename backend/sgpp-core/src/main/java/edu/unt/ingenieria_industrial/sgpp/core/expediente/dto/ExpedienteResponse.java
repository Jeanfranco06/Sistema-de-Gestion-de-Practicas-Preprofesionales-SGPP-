package edu.unt.ingenieria_industrial.sgpp.core.expediente.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpedienteResponse {
    private Long id;
    private String codigoExpediente;
    private Long idEstudiante;
    private String codigoEstudiantil;
    private String nombreEstudiante;
    private String apellidoEstudiante;
    private Long idTipoPractica;
    private String codigoTipoPractica;
    private String nombreTipoPractica;
    private String periodoAcademico;
    private String condicionSolicitante;
    private String estado;

    private Long idEmpresa;
    private String nombreEmpresa;
    private String rucEmpresa;
    private Long idSedePractica;
    private String nombreSede;

    private Long idAsesor;
    private String nombreAsesor;
    private String resolucionAsesor;
    private Long idConvenio;
    private String numeroConvenio;

    private Boolean cartaAceptacionPresentada;
    private Boolean planTrabajoAprobado;
    private LocalDateTime fechaPresentacionPlan;
    private LocalDate fechaInicioPractica;
    private LocalDate fechaFinPractica;
    private Integer duracionSemanas;
    private Integer numeroInformesParciales;
    private Boolean informeFinalPresentado;
    private BigDecimal calificacionFinal;
    private String observaciones;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    private List<ExpedienteEstadoResponse> estadoHistorial;
    private List<ExpedienteDocumentoResponse> documentos;
    private List<ExpedienteComiteResponse> comite;
    private List<ExpedienteObservacionResponse> observacionesList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpedienteEstadoResponse {
        private Long id;
        private String estadoAnterior;
        private String estadoNuevo;
        private Long idUsuario;
        private String nombreUsuario;
        private LocalDateTime fechaCambio;
        private String observacion;
        private String tipoCambio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpedienteDocumentoResponse {
        private Long id;
        private String tipoDocumento;
        private String nombreArchivo;
        private String rutaArchivo;
        private String estado;
        private Long idUsuario;
        private LocalDateTime fechaSubida;
        private String observaciones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpedienteComiteResponse {
        private Long id;
        private Long idUsuario;
        private String nombreUsuario;
        private String rolComite;
        private LocalDateTime fechaAsignacion;
        private Boolean activo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpedienteObservacionResponse {
        private Long id;
        private Long idUsuarioOrigen;
        private String nombreUsuarioOrigen;
        private String tipo;
        private String descripcion;
        private LocalDateTime fechaCreacion;
        private Boolean subsanado;
        private LocalDateTime fechaSubsanacion;
        private String respuestaSubsanacion;
    }
}
