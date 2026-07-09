package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.EstadoAcademico;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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
public class EstudianteUpdateDTO {

    @NotNull(message = "El semestre actual es requerido")
    @Positive(message = "El semestre actual debe ser positivo")
    private Integer semestreActual;

    @NotNull(message = "Los créditos aprobados son requeridos")
    @PositiveOrZero(message = "Los créditos aprobados no pueden ser negativos")
    private Integer creditosAprobados;

    @PositiveOrZero(message = "El promedio ponderado no puede ser negativo")
    private BigDecimal promedioPonderado;

    private LocalDate fechaIngreso;

    @NotNull(message = "El estado académico es requerido")
    private EstadoAcademico estadoAcademico;
}
