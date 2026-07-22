package edu.unt.ingenieria_industrial.sgpp.core.hora.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "registro_hora")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegistroHora extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_control_hora", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ControlHora controlHora;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    @Column(name = "horas", nullable = false)
    private Integer horas;

    @Column(name = "descripcion_actividad", columnDefinition = "TEXT")
    private String descripcionActividad;

    @Column(name = "tipo_registro", nullable = false, length = 30)
    private String tipoRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_registra", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuarioRegistra;

    @Column(name = "validado_por_tutor")
    @Builder.Default
    private Boolean validadoPorTutor = false;

    @Column(name = "rechazado_por_tutor")
    @Builder.Default
    private Boolean rechazadoPorTutor = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tutor_valida")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario tutorValida;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}
