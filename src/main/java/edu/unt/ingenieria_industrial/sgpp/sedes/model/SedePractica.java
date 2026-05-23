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
@Table(name = "sede_practica")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SedePractica extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa", nullable = false)
    private Empresa empresa;

    @Column(name = "nombre_sede", length = 200, nullable = false)
    private String nombreSede;

    @Column(name = "direccion", length = 300, nullable = false)
    private String direccion;

    @Column(name = "distrito", length = 100)
    private String distrito;

    @Column(name = "provincia", length = 100)
    private String provincia;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "nombre_contacto", length = 200)
    private String nombreContacto;

    @Column(name = "cargo_contacto", length = 100)
    private String cargoContacto;

    @Column(name = "telefono_contacto", length = 20)
    private String telefonoContacto;

    @Column(name = "email_contacto", length = 100)
    private String emailContacto;

    @Column(name = "capacidad_maxima")
    private Integer capacidadMaxima;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
