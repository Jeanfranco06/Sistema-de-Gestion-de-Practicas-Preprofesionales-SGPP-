package edu.unt.ingenieria_industrial.sgpp.usuarios.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.unt.ingenieria_industrial.sgpp.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.EstadoAcademico;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "estudiante")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Estudiante extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", unique = true, nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @Column(name = "codigo_estudiantil", unique = true, nullable = false, length = 20)
    private String codigoEstudiantil;

    @Column(name = "semestre_actual", nullable = false)
    private Integer semestreActual;

    @Column(name = "creditos_aprobados")
    @Builder.Default
    private Integer creditosAprobados = 0;

    @Column(name = "creditos_requeridos_practica")
    @Builder.Default
    private Integer creditosRequeridosPractica = 0;

    @Column(name = "promedio_ponderado", precision = 5, scale = 2)
    private BigDecimal promedioPonderado;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "fecha_egreso_estimada")
    private LocalDate fechaEgresoEstimada;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_academico", nullable = false, length = 20)
    private EstadoAcademico estadoAcademico;

    @Column(name = "id_periodo_academico_actual")
    private Long idPeriodoAcademicoActual;
}
