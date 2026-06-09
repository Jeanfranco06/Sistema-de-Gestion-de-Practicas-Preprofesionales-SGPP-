package edu.unt.ingenieria_industrial.sgpp.core.hora.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarHoraRequest {

    @NotNull
    private LocalDate fecha;

    private LocalTime horaInicio;

    private LocalTime horaFin;

    @NotNull
    @Min(1)
    private Integer horas;

    @NotBlank
    private String descripcionActividad;

    @NotBlank
    private String tipoRegistro;

    private String observaciones;
}
