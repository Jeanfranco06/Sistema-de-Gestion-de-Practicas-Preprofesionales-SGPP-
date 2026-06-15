package edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto;

import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiResponseDTO<T> {

    private KpiMetadataDTO metadata;
    private ReporteFiltroDTO filtrosAplicados;
    private T datos;
}
