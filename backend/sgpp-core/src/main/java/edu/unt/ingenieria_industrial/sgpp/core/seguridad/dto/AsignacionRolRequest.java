package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.RolSistema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionRolRequest {
    @NotEmpty(message = "Debe especificar al menos un rol")
    private Set<RolSistema> roles;
}
