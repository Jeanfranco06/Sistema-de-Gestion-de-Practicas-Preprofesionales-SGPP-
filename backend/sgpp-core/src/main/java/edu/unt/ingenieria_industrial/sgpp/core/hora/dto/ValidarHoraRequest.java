package edu.unt.ingenieria_industrial.sgpp.core.hora.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidarHoraRequest {

    @NotNull
    private Boolean validado;

    private String observaciones;
}
