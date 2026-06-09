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
public class EvaluarExpedienteRequest {
    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("20.00")
    private BigDecimal calificacionFinal;

    private String observaciones;

    private Boolean cerrarExpediente;
}
