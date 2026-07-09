package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SedePracticaDTO {
    private Long id;

    @NotNull(message = "La empresa es obligatoria")
    private Long empresaId;

    private String razonSocialEmpresa;

    @NotBlank(message = "El nombre de la sede es obligatorio")
    @Size(max = 200, message = "El nombre no debe exceder 200 caracteres")
    private String nombreSede;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 300, message = "La dirección no debe exceder 300 caracteres")
    private String direccion;

    @Size(max = 100)
    private String distrito;

    @Size(max = 100)
    private String provincia;

    @Size(max = 100)
    private String departamento;

    @Size(max = 20, message = "El teléfono no debe exceder 20 caracteres")
    private String telefono;

    @Email(message = "Formato de correo inválido")
    @Size(max = 100)
    private String email;

    @Size(max = 200)
    private String nombreContacto;

    @Size(max = 100)
    private String cargoContacto;

    @Size(max = 20)
    private String telefonoContacto;

    @Email(message = "Formato de correo inválido")
    @Size(max = 100)
    private String emailContacto;

    private Integer capacidadMaxima;
    private Boolean activo;

    @Size(max = 20)
    private String tipoEntidad;

    @Size(max = 200)
    private String areaUnidad;

    private String descripcionGeneral;
    private String actividadesPrincipales;
    private String riesgosRelevantes;

    @Size(max = 200)
    private String nombreTutorEmpresa;

    @Size(max = 100)
    private String cargoTutorEmpresa;

    @Email(message = "Formato de correo inválido")
    @Size(max = 100)
    private String correoTutorEmpresa;

    @Size(max = 20)
    private String telefonoTutorEmpresa;

    @Size(max = 20)
    private String estadoSede;
}

