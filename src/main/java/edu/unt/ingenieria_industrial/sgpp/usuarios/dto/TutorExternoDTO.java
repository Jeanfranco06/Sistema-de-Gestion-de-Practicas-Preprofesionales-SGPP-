package edu.unt.ingenieria_industrial.sgpp.usuarios.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorExternoDTO {
    private Long id;
    private Long idUsuario;
    private String cargo;
    private String area;
    private String empresaNombre;
    private Boolean activo;
}
