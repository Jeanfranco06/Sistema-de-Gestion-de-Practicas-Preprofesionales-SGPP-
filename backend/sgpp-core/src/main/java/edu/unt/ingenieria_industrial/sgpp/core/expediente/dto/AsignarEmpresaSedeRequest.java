package edu.unt.ingenieria_industrial.sgpp.core.expediente.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignarEmpresaSedeRequest {
    @NotNull
    private Long idEmpresa;

    @NotNull
    private Long idSedePractica;

    private Long idConvenio;
}
