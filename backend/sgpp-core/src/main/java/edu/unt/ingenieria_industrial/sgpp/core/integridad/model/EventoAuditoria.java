package edu.unt.ingenieria_industrial.sgpp.core.integridad.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "evento_auditoria")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EventoAuditoria extends BaseEntity {

    @Column(name = "tipo_entidad", nullable = false, length = 50)
    private String tipoEntidad;

    @Column(name = "entidad_id")
    private Long entidadId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Expediente expediente;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @Column(name = "username_usuario", length = 100)
    private String usernameUsuario;

    @Column(name = "rol_usuario", length = 100)
    private String rolUsuario;

    @Column(name = "fecha_hora", nullable = false)
    @Builder.Default
    private LocalDateTime fechaHora = LocalDateTime.now();

    @Column(name = "valor_anterior", columnDefinition = "TEXT")
    private String valorAnterior;

    @Column(name = "valor_nuevo", columnDefinition = "TEXT")
    private String valorNuevo;

    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "origen", nullable = false, length = 30)
    @Builder.Default
    private String origen = "API";

    @Column(name = "resultado", nullable = false, length = 30)
    @Builder.Default
    private String resultado = "EXITOSO";

    @Column(name = "ip_origen", length = 50)
    private String ipOrigen;

    @Column(name = "detalle_adicional", columnDefinition = "TEXT")
    private String detalleAdicional;

    @Column(name = "cumplimiento_plazo")
    private Boolean cumplimientoPlazo;

    @Column(name = "id_control_plazo")
    private Long idControlPlazo;
}
