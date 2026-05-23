package edu.unt.ingenieria_industrial.sgpp.practicas.model;

import edu.unt.ingenieria_industrial.sgpp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "monitoreo")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Monitoreo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practica", nullable = false)
    private Practica practica;

    @Column(name = "fecha_visita", nullable = false)
    private LocalDate fechaVisita;

    @Column(name = "tipo_visitante", length = 50, nullable = false)
    private String tipoVisitante; // DOCENTE, COMITE

    @Column(name = "visitante_id")
    private Long visitanteId;

    @Column(name = "objetivo_visita", columnDefinition = "TEXT")
    private String objetivoVisita;

    @Column(name = "hallazgos", columnDefinition = "TEXT")
    private String hallazgos;

    @Column(name = "recomendaciones", columnDefinition = "TEXT")
    private String recomendaciones;

    @Column(name = "calificacion_global")
    private Integer calificacionGlobal;
}
