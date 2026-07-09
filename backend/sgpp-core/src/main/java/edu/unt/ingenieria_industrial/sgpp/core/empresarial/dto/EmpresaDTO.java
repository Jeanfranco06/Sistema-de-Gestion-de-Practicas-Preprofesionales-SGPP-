package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaDTO {
    private Long id;

    @NotBlank(message = "El RUC es obligatorio")
    @Pattern(regexp = "\\d{11}", message = "El RUC debe tener exactamente 11 dígitos numéricos")
    private String ruc;

    @NotBlank(message = "La razón social es obligatoria")
    @Size(max = 200, message = "La razón social no debe exceder 200 caracteres")
    private String razonSocial;

    @Size(max = 200, message = "El nombre comercial no debe exceder 200 caracteres")
    private String nombreComercial;

    @Size(max = 300, message = "La dirección no debe exceder 300 caracteres")
    private String direccion;

    @Size(max = 100)
    private String distrito;

    @Size(max = 100)
    private String provincia;

    @Size(max = 100)
    private String departamento;

    @Size(max = 100)
    private String pais;

    @Size(max = 20, message = "El teléfono no debe exceder 20 caracteres")
    private String telefono;

    @Email(message = "Formato de correo inválido")
    @Size(max = 100)
    private String email;

    @Size(max = 200)
    private String paginaWeb;

    @Size(max = 100)
    private String sectorEconomico;

    @Size(max = 50)
    private String tamanoEmpresa;

    private Boolean activo;
    private Boolean validado;
}

