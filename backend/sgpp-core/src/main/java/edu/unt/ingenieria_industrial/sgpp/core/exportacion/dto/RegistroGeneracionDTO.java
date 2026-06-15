package edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroGeneracionDTO {

    private Long id;
    private String tipoDocumento;
    private String formatoSalida;
    private String nombreArchivo;
    private String rutaArchivo;
    private Long idUsuarioSolicitante;
    private String nombreSolicitante;
    private Long idExpediente;
    private String tipoReporte;
    private String filtrosAplicados;
    private String hashContenido;
    private Long tamanoBytes;
    private LocalDateTime fechaGeneracion;
    private String observaciones;
}
