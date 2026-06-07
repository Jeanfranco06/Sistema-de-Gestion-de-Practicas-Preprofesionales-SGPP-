package edu.unt.ingenieria_industrial.sgpp.shared.model;

import edu.unt.ingenieria_industrial.sgpp.shared.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notificacion")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Notificacion extends BaseEntity {

    @Column(name = "usuario_destino", length = 100, nullable = false)
    private String usuarioDestino;

    @Column(name = "tipo_notificacion", length = 50, nullable = false)
    private String tipoNotificacion;

    @Column(name = "titulo", length = 200, nullable = false)
    private String titulo;

    @Column(name = "mensaje", columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(name = "fecha_envio", nullable = false)
    @Builder.Default
    private LocalDateTime fechaEnvio = LocalDateTime.now();

    @Column(name = "leida", nullable = false)
    @Builder.Default
    private Boolean leida = false;

    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

