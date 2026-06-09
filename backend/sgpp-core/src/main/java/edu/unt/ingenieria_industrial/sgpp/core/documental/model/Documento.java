package edu.unt.ingenieria_industrial.sgpp.core.documental.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.Practica;
import edu.unt.ingenieria_industrial.sgpp.core.model.EstadoDocumento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "documento")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Documento extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practica", nullable = false)
    private Practica practica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_documento", nullable = false)
    private TipoDocumento tipoDocumento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado", nullable = false)
    private EstadoDocumento estado;

    @Column(name = "nombre_archivo", length = 255, nullable = false)
    private String nombreArchivo;

    @Column(name = "ruta_archivo", length = 500, nullable = false)
    private String rutaArchivo;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "tipo_mime", length = 100)
    private String tipoMime;

    @Column(name = "fecha_carga", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCarga = LocalDateTime.now();

    @Column(name = "fecha_revision")
    private LocalDateTime fechaRevision;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

