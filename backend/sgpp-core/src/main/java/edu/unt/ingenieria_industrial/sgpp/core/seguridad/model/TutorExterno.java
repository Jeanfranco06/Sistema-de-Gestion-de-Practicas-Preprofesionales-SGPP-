package edu.unt.ingenieria_industrial.sgpp.core.seguridad.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@Table(name = "tutor_externo")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TutorExterno extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", unique = true, nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede")
    private SedePractica sede;

    @Column(name = "cargo", nullable = false, length = 100)
    private String cargo;

    @Column(name = "area", length = 100)
    private String area;

    @Column(name = "empresa_nombre", length = 200)
    private String empresaNombre;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "estado_tutor", length = 20)
    @Builder.Default
    private String estadoTutor = "ACTIVO";
}

