package edu.unt.ingenieria_industrial.sgpp.core.documental.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "tipo_documento")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TipoDocumento extends BaseEntity {

    @Column(name = "codigo", unique = true, nullable = false, length = 50)
    private String codigo;

    @Column(name = "nombre", unique = true, nullable = false, length = 50)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "formato", length = 20)
    private String formato;

    @Column(name = "max_tamano_mb")
    private Integer maxTamanoMb;

    @Column(name = "tipo_practica", length = 20)
    private String tipoPractica;

    @Column(name = "obligatorio", nullable = false)
    @Builder.Default
    private Boolean obligatorio = false;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

