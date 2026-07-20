package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

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
public class NotaUnidadRequestDTO {

    @NotNull(message = "El número de unidad es obligatorio")
    private Integer numeroUnidad;

    @DecimalMin(value = "0.00", inclusive = true, message = "La nota mínima es 0")
    @DecimalMax(value = "20.00", inclusive = true, message = "La nota máxima es 20")
    private BigDecimal notaPlan;

    @NotNull(message = "La nota del informe es obligatoria")
    @DecimalMin(value = "0.00", inclusive = true, message = "La nota mínima es 0")
    @DecimalMax(value = "20.00", inclusive = true, message = "La nota máxima es 20")
    private BigDecimal notaInforme;

    private String comentarios;
}
