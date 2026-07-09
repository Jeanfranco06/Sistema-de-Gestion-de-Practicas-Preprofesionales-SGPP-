package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvenioDTO {
    private Long id;

    @NotNull(message = "La empresa es obligatoria")
    private Long empresaId;

    private String razonSocialEmpresa;

    @NotBlank(message = "El número de convenio es obligatorio")
    @Size(max = 50, message = "El número no debe exceder 50 caracteres")
    private String numeroConvenio;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @Size(max = 500, message = "El objetivo no debe exceder 500 caracteres")
    private String objetivo;

    private Boolean vigente;
    private Boolean activo;
}

