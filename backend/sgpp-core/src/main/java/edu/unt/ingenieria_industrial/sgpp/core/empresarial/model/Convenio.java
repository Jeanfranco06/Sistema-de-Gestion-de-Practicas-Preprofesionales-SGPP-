package edu.unt.ingenieria_industrial.sgpp.core.empresarial.model;

import edu.unt.ingenieria_industrial.sgpp.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "convenio")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Convenio extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa", nullable = false)
    private Empresa empresa;

    @Column(name = "numero_convenio", length = 50, unique = true, nullable = false)
    private String numeroConvenio;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "objetivo", columnDefinition = "TEXT")
    private String objetivo;

    @Column(name = "vigente", nullable = false)
    @Builder.Default
    private Boolean vigente = true;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}

