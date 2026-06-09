package edu.unt.ingenieria_industrial.sgpp.core.responsables.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponsableVigenteDTO {

    private DesignacionCoordinadorResponse coordinador;
    private List<ComiteResponse> comite;
    private int totalIntegrantesComite;
    private int limiteIntegrantes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComiteResponse {
        private Long id;
        private Long idUsuario;
        private String nombres;
        private String apellidos;
        private String email;
        private Long idDocente;
        private String codigoDocente;
        private String categoriaDocente;
        private String rol;
        private LocalDate fechaInicio;
        private LocalDate fechaFin;
        private String resolucionDesignacion;
        private String periodoAcademico;
    }
}
