package edu.unt.ingenieria_industrial.sgpp.core.empresarial.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
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

    // Nuevos campos para perfil de sede
    @Column(name = "tipo_entidad", length = 20)
    private String tipoEntidad;

    @Column(name = "area_unidad", length = 200)
    private String areaUnidad;

    @Column(name = "descripcion_general", columnDefinition = "TEXT")
    private String descripcionGeneral;

    @Column(name = "actividades_principales", columnDefinition = "TEXT")
    private String actividadesPrincipales;

    @Column(name = "riesgos_relevantes", columnDefinition = "TEXT")
    private String riesgosRelevantes;

    @Column(name = "nombre_tutor_empresa", length = 200)
    private String nombreTutorEmpresa;

    @Column(name = "cargo_tutor_empresa", length = 100)
    private String cargoTutorEmpresa;

    @Column(name = "correo_tutor_empresa", length = 100)
    private String correoTutorEmpresa;

    @Column(name = "telefono_tutor_empresa", length = 20)
    private String telefonoTutorEmpresa;

    @Column(name = "estado_sede", length = 20)
    @Builder.Default
    private String estadoSede = "ACTIVA";
}

