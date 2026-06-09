package edu.unt.ingenieria_industrial.sgpp.core.academico.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Entity
@Table(name = "parametro_regla")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ParametroRegla extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_regla_validacion", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ReglaValidacion reglaValidacion;

    @Column(name = "clave", length = 100, nullable = false)
    private String clave;

    @Column(name = "valor", length = 500, nullable = false)
    private String valor;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
