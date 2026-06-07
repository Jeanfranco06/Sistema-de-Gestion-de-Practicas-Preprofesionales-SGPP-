package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

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
    private Long empresaId;
    private String razonSocialEmpresa; // Ãštil para mostrar en listados
    private String nombreSede;
    private String direccion;
    private String distrito;
    private String provincia;
    private String departamento;
    private String telefono;
    private String email;
    private String nombreContacto;
    private String cargoContacto;
    private String telefonoContacto;
    private String emailContacto;
    private Integer capacidadMaxima;
    private Boolean activo;
}

