package edu.unt.ingenieria_industrial.sgpp.core.integridad.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.AccionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoEntidadAuditable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaAuditoriaFiltroDTO {

    private Long idExpediente;
    private Long idUsuario;
    private TipoEntidadAuditable tipoEntidad;
    private AccionAuditoria accion;
    private String resultado;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaDesde;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaHasta;

    @Builder.Default
    private Integer limite = 100;
}
