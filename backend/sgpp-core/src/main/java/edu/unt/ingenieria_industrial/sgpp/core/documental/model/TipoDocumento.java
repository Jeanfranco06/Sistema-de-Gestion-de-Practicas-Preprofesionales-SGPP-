package edu.unt.ingenieria_industrial.sgpp.core.documental.model;

import edu.unt.ingenieria_industrial.sgpp.shared.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoEnum;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "nombre", unique = true, nullable = false, length = 50)
    private TipoDocumentoEnum nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "obligatorio", nullable = false)
    @Builder.Default
    private Boolean obligatorio = false;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

