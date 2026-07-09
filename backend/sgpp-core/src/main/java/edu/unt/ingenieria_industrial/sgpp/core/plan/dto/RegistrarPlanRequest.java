package edu.unt.ingenieria_industrial.sgpp.core.plan.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarPlanRequest {

    @NotNull
    private Long idExpediente;

    @Valid
    @NotNull
    private CaratulaData caratula;

    @Valid
    @NotNull
    private EmpresaData datosEmpresa;

    @Valid
    private AreaDepartamentoData areaDepartamento;

    @NotBlank
    private String situacionProblematica;

    @NotEmpty
    @Valid
    private List<ObjetivoData> objetivos;

    @NotBlank
    private String tecnicasProcedimientos;

    @Valid
    private List<TeoriaTecnicaData> teoriasTecnicas;

    @NotEmpty
    @Valid
    private List<ActividadData> cronograma;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CaratulaData {
        @NotBlank
        private String institucion;
        @NotBlank
        private String nombrePlan;
        @NotBlank
        private String autor;
        private String asesor;
        @NotNull
        private LocalDate fecha;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EmpresaData {
        @NotBlank
        private String razonSocial;
        @NotBlank
        private String direccion;
        private String representanteLegal;
        @NotBlank
        private String telefono;
        private String correo;
        private String celular;
        @NotBlank
        private String descripcionGeneral;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AreaDepartamentoData {
        @NotBlank
        private String areaDepartamento;
        private String funcionarioACargo;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ObjetivoData {
        @NotBlank
        private String tipo;
        @NotBlank
        private String descripcion;
        @NotNull
        private Integer orden;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TeoriaTecnicaData {
        @NotBlank
        private String nombre;
        private String descripcion;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ActividadData {
        private Long idObjetivoEspecifico;
        @NotBlank
        private String actividad;
        private LocalDate fechaInicioPrevista;
        private LocalDate fechaFinPrevista;
        private Integer duracionSemanas;
        @NotNull
        private Integer orden;
    }
}
