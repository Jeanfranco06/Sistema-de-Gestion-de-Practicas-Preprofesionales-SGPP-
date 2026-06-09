package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.EstadoAcademico;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstudianteDTO {
    private Long id;
    private Long idUsuario;
    private String codigoEstudiantil;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private Integer semestreActual;
    private Integer creditosAprobados;
    private Integer creditosRequeridosPractica;
    private BigDecimal promedioPonderado;
    private LocalDate fechaIngreso;
    private EstadoAcademico estadoAcademico;
}

