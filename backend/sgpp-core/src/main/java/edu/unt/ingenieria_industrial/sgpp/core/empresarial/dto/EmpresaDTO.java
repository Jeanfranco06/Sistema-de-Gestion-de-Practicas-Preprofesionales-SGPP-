package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

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
    private String ruc;
    private String razonSocial;
    private String nombreComercial;
    private String direccion;
    private String distrito;
    private String provincia;
    private String departamento;
    private String pais;
    private String telefono;
    private String email;
    private String paginaWeb;
    private String sectorEconomico;
    private String tamanoEmpresa;
    private Boolean activo;
    private Boolean validado;
}

