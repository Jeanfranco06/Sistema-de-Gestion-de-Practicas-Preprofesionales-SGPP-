package edu.unt.ingenieria_industrial.sgpp.core.expediente.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignarComiteRequest {
    @NotEmpty
    @Valid
    private List<MiembroComite> miembros;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MiembroComite {
        private Long idUsuario;
        private String rolComite;
    }
}
