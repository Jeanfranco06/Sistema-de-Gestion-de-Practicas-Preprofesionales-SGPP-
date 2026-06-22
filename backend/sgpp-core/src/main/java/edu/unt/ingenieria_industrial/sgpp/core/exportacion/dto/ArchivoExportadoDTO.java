package edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoExportadoDTO {

    private Long idRegistro;
    private String nombreArchivo;
    private String contentType;
    private FormatoExportacion formato;
    private TipoDocumentoInstitucional tipoDocumento;
    private TipoReporte tipoReporte;
    private Long idExpediente;
    private String codigoTrazabilidad;
    private Long tamanoBytes;
    private LocalDateTime fechaGeneracion;
    private byte[] contenido;
}
