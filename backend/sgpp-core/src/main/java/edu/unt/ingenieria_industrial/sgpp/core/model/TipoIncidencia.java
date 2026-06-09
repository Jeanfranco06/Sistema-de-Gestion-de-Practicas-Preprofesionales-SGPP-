package edu.unt.ingenieria_industrial.sgpp.core.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "tipo_incidencia")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TipoIncidencia extends BaseEntity {

    @Column(name = "codigo", length = 50, unique = true, nullable = false)
    private String codigo;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "gravedad", length = 50)
    private String gravedad;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
