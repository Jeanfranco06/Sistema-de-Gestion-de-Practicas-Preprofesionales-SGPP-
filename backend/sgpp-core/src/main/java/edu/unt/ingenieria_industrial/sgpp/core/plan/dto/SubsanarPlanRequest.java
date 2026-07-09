package edu.unt.ingenieria_industrial.sgpp.core.plan.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubsanarPlanRequest {

    @NotEmpty
    private List<Long> observacionIds;

    @NotBlank
    private String respuesta;

    @Valid
    @NotNull
    private RegistrarPlanRequest.CaratulaData caratula;

    @Valid
    @NotNull
    private RegistrarPlanRequest.EmpresaData datosEmpresa;

    @Valid
    private RegistrarPlanRequest.AreaDepartamentoData areaDepartamento;

    @NotBlank
    private String situacionProblematica;

    @NotEmpty
    @Valid
    private List<RegistrarPlanRequest.ObjetivoData> objetivos;

    @NotBlank
    private String tecnicasProcedimientos;

    @Valid
    private List<RegistrarPlanRequest.TeoriaTecnicaData> teoriasTecnicas;

    @NotEmpty
    @Valid
    private List<RegistrarPlanRequest.ActividadData> cronograma;
}
