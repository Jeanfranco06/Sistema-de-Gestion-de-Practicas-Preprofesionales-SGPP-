package edu.unt.ingenieria_industrial.sgpp.core.hora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroHoraResponse {
    private Long id;
    private Long idControlHora;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Integer horas;
    private String descripcionActividad;
    private String tipoRegistro;
    private String usuarioRegistra;
    private Boolean validadoPorTutor;
    private String tutorValida;
    private String observaciones;
}
