package edu.unt.ingenieria_industrial.sgpp.core.exportacion.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "registro_generacion_documental")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegistroGeneracionDocumental extends BaseEntity {

    @Column(name = "tipo_documento", nullable = false, length = 50)
    private String tipoDocumento;

    @Column(name = "formato_salida", nullable = false, length = 10)
    private String formatoSalida;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "ruta_archivo", length = 500)
    private String rutaArchivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_solicitante", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuarioSolicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Expediente expediente;

    @Column(name = "tipo_reporte", length = 50)
    private String tipoReporte;

    @Column(name = "filtros_aplicados", columnDefinition = "TEXT")
    private String filtrosAplicados;

    @Column(name = "hash_contenido", length = 64)
    private String hashContenido;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "fecha_generacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaGeneracion = LocalDateTime.now();

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}
