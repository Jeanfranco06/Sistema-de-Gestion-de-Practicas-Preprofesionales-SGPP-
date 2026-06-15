package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.CondicionSubsanacionFiltro;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoSalidaReporte;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteFiltroDTO {

    private String periodoAcademico;
    private String codigoTipoPractica;
    private String estadoExpediente;
    private Long idEmpresa;
    private Long idSede;
    private Long idAsesor;
    private Long idComiteUsuario;
    private Boolean convenioVigente;
    private CondicionSubsanacionFiltro condicionSubsanacion;

    private LocalDate fechaDesde;
    private LocalDate fechaHasta;

    @Builder.Default
    private FormatoSalidaReporte formato = FormatoSalidaReporte.COMPLETO;
}
