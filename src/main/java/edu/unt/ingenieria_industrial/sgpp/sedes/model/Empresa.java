package edu.unt.ingenieria_industrial.sgpp.sedes.model;

import edu.unt.ingenieria_industrial.sgpp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "empresa")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Empresa extends BaseEntity {

    @Column(name = "ruc", length = 11, unique = true, nullable = false)
    private String ruc;

    @Column(name = "razon_social", length = 200, nullable = false)
    private String razonSocial;

    @Column(name = "nombre_comercial", length = 200)
    private String nombreComercial;

    @Column(name = "direccion", length = 300)
    private String direccion;

    @Column(name = "distrito", length = 100)
    private String distrito;

    @Column(name = "provincia", length = 100)
    private String provincia;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @Column(name = "pais", length = 100)
    private String pais;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "pagina_web", length = 200)
    private String paginaWeb;

    @Column(name = "sector_economico", length = 100)
    private String sectorEconomico;

    @Column(name = "tamano_empresa", length = 50)
    private String tamanoEmpresa;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "validado", nullable = false)
    @Builder.Default
    private Boolean validado = false;
}
