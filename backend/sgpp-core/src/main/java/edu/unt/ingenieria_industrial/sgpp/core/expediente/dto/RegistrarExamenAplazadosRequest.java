package edu.unt.ingenieria_industrial.sgpp.core.expediente.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarExamenAplazadosRequest {

    @NotNull(message = "La nota del examen es obligatoria")
    @DecimalMin(value = "0.00", inclusive = true, message = "La nota mínima es 0")
    @DecimalMax(value = "20.00", inclusive = true, message = "La nota máxima es 20")
    private BigDecimal nota;

    private String comentarios;
}
