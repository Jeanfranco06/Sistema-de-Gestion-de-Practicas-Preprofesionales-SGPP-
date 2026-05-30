package edu.unt.ingenieria_industrial.sgpp.usuarios.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionRequisitosDTO {
    private Boolean cumpleCreditos;
    private Integer creditosActuales;
    private Integer creditosRequeridos;
    
    private Boolean cumpleSemestre;
    private Integer semestreActual;
    private Integer semestreRequerido;
    
    private Boolean matriculaActiva;
    private String estadoAcademico;
    
    private Boolean aptoParaPracticas;
}
