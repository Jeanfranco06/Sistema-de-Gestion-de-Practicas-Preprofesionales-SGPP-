package edu.unt.ingenieria_industrial.sgpp.core.expediente.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "expediente")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Expediente extends BaseEntity {

    @Column(name = "codigo_expediente", unique = true, nullable = false, length = 30)
    private String codigoExpediente;

    @Column(name = "numero_expediente", nullable = false, length = 50)
    private String numeroExpediente;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDate fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDate fechaCierre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_practica", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TipoPractica tipoPractica;

    @Column(name = "periodo_academico", length = 20)
    private String periodoAcademico;

    @Column(name = "condicion_solicitante", nullable = false, length = 20)
    @Builder.Default
    private String condicionSolicitante = "ESTUDIANTE";

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "BORRADOR";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede_practica")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SedePractica sedePractica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asesor")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario asesor;

    @Column(name = "resolucion_asesor", length = 100)
    private String resolucionAsesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_convenio")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Convenio convenio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tutor_empresa")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TutorExterno tutorEmpresa;

    @Column(name = "carta_aceptacion_presentada")
    @Builder.Default
    private Boolean cartaAceptacionPresentada = false;

    @Column(name = "plan_trabajo_aprobado")
    @Builder.Default
    private Boolean planTrabajoAprobado = false;

    @Column(name = "fecha_presentacion_plan")
    private LocalDateTime fechaPresentacionPlan;

    @Column(name = "fecha_inicio_practica")
    private LocalDate fechaInicioPractica;

    @Column(name = "fecha_fin_practica")
    private LocalDate fechaFinPractica;

    @Column(name = "duracion_semanas")
    private Integer duracionSemanas;

    @Column(name = "numero_informes_parciales")
    @Builder.Default
    private Integer numeroInformesParciales = 0;

    @Column(name = "informe_final_presentado")
    @Builder.Default
    private Boolean informeFinalPresentado = false;

    @Column(name = "calificacion_final", precision = 4, scale = 2)
    private BigDecimal calificacionFinal;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<ExpedienteEstado> estados = new ArrayList<>();

    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<ExpedienteDocumento> documentos = new ArrayList<>();

    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<ExpedienteComite> comite = new ArrayList<>();

    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<ExpedienteObservacion> observacionesList = new ArrayList<>();
}
