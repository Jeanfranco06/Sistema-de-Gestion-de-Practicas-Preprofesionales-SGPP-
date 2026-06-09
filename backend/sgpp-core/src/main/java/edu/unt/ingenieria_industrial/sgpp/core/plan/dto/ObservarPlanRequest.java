package edu.unt.ingenieria_industrial.sgpp.core.plan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObservarPlanRequest {
    @NotBlank
    private String descripcion;
}
