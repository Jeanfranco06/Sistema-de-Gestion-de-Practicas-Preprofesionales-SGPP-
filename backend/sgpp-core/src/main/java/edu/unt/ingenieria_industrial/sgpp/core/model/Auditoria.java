package edu.unt.ingenieria_industrial.sgpp.core.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "auditoria")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Auditoria extends BaseEntity {

    @Column(name = "usuario", length = 100, nullable = false)
    private String usuario;

    @Column(name = "accion", length = 100, nullable = false)
    private String accion;

    @Column(name = "entidad", length = 100, nullable = false)
    private String entidad;

    @Column(name = "entidad_id")
    private Long entidadId;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "ip_origen", length = 50)
    private String ipOrigen;

    @Column(name = "fecha_accion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaAccion = LocalDateTime.now();
}
