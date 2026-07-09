package edu.unt.ingenieria_industrial.sgpp.core.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanGeneralResponse {
    private Long id;
    private Long idExpediente;
    private String codigoExpediente;
    private Integer version;
    private String estado;
    private LocalDateTime fechaPresentacion;
    private LocalDateTime fechaUltimaRevision;
    private String observacionGeneral;

    private CaratulaResponse caratula;
    private EmpresaResponse datosEmpresa;
    private AreaDepartamentoResponse areaDepartamento;
    private String situacionProblematica;
    private List<ObjetivoResponse> objetivos;
    private String tecnicasProcedimientos;
    private List<TeoriaTecnicaResponse> teoriasTecnicas;
    private List<ActividadResponse> cronograma;
    private List<ObservacionResponse> observaciones;
    private List<HistorialEstadoResponse> historialEstados;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CaratulaResponse {
        private String institucion;
        private String nombrePlan;
        private String autor;
        private String asesor;
        private LocalDate fecha;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EmpresaResponse {
        private String razonSocial;
        private String direccion;
        private String representanteLegal;
        private String telefono;
        private String correo;
        private String celular;
        private String descripcionGeneral;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AreaDepartamentoResponse {
        private String areaDepartamento;
        private String funcionarioACargo;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ObjetivoResponse {
        private Long id;
        private String tipo;
        private String descripcion;
        private Integer orden;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TeoriaTecnicaResponse {
        private String nombre;
        private String descripcion;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ActividadResponse {
        private Long id;
        private Long idObjetivoEspecifico;
        private String actividad;
        private LocalDate fechaInicioPrevista;
        private LocalDate fechaFinPrevista;
        private Integer duracionSemanas;
        private Integer orden;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ObservacionResponse {
        private Long id;
        private Long idUsuarioOrigen;
        private String nombreUsuarioOrigen;
        private String descripcion;
        private String tipo;
        private Boolean subsanado;
        private LocalDateTime fechaSubsanacion;
        private String respuestaSubsanacion;
        private LocalDateTime fechaCreacion;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HistorialEstadoResponse {
        private Long id;
        private String estadoAnterior;
        private String estadoNuevo;
        private Long idUsuario;
        private String nombreUsuario;
        private String observacion;
        private LocalDateTime fechaCambio;
        private String tipoCambio;
    }
}
