package edu.unt.ingenieria_industrial.sgpp.core.documental.model;

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
@Table(name = "observacion_documento")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ObservacionDocumento extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_documento", nullable = false)
    private Documento documento;

    @Column(name = "observacion", columnDefinition = "TEXT", nullable = false)
    private String observacion;

    @Column(name = "fecha_observacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaObservacion = LocalDateTime.now();

    @Column(name = "usuario_observacion", length = 100)
    private String usuarioObservacion;

    @Column(name = "resuelta", nullable = false)
    @Builder.Default
    private Boolean resuelta = false;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(name = "usuario_resolucion", length = 100)
    private String usuarioResolucion;
}

