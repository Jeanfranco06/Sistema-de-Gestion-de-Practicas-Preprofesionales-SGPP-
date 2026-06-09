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
    private String razonSocialEmpresa; // Útil para mostrar en listados
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

    // Nuevos campos para perfil de sede
    private String tipoEntidad;
    private String areaUnidad;
    private String descripcionGeneral;
    private String actividadesPrincipales;
    private String riesgosRelevantes;
    private String nombreTutorEmpresa;
    private String cargoTutorEmpresa;
    private String correoTutorEmpresa;
    private String telefonoTutorEmpresa;
    private String estadoSede;
}

