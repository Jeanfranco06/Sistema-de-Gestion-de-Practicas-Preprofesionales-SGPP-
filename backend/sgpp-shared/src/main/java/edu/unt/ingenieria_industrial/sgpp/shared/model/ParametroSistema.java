package edu.unt.ingenieria_industrial.sgpp.shared.model;

import edu.unt.ingenieria_industrial.sgpp.shared.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "parametro_sistema")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ParametroSistema extends BaseEntity {

    @Column(name = "clave", length = 100, unique = true, nullable = false)
    private String clave;

    @Column(name = "valor", columnDefinition = "TEXT", nullable = false)
    private String valor;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "tipo_dato", length = 50)
    private String tipoDato;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

