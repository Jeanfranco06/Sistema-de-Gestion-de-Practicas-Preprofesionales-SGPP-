package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvenioDTO {
    private Long id;
    private Long empresaId;
    private String razonSocialEmpresa; // Ãštil para mostrar en listados
    private String numeroConvenio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String objetivo;
    private Boolean vigente;
    private Boolean activo;
}

