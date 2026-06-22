package edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerarDocumentoInternoRequest {

    @NotNull
    private TipoDocumentoInstitucional tipoDocumento;

    @NotNull
    private Long idExpediente;

    private String observacionesAdicionales;
}
