package edu.unt.ingenieria_industrial.sgpp.core.seguridad.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.unt.ingenieria_industrial.sgpp.shared.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@Table(name = "docente")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Docente extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", unique = true, nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @Column(name = "codigo_docente", unique = true, nullable = false, length = 20)
    private String codigoDocente;

    @Column(name = "categoria", length = 50)
    private String categoria;

    @Column(name = "especialidad", length = 100)
    private String especialidad;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "max_practicantes")
    @Builder.Default
    private Integer maxPracticantes = 10;
}

