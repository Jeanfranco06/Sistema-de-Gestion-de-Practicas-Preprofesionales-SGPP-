package edu.unt.ingenieria_industrial.sgpp.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "requisito_academico")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RequisitoAcademico extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_practica", nullable = false)
    private TipoPractica tipoPractica;

    @Column(name = "nombre", length = 200, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "obligatorio", nullable = false)
    @Builder.Default
    private Boolean obligatorio = true;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
