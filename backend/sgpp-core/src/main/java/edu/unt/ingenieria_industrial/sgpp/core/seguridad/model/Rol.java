package edu.unt.ingenieria_industrial.sgpp.core.seguridad.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.RolSistema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@Table(name = "rol")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Rol extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "nombre", unique = true, nullable = false, length = 50)
    private RolSistema nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "rol", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private java.util.Set<UsuarioRol> usuarioRoles;
}

