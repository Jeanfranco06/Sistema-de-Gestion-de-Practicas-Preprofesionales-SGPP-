package edu.unt.ingenieria_industrial.sgpp.core.integridad.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrazabilidadExpedienteDTO {

    private Long idExpediente;
    private String codigoExpediente;
    private String estadoActual;
    private LocalDateTime generadoEn;
    private long totalEventos;
    private List<HitoTrazabilidadDTO> lineaTiempo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HitoTrazabilidadDTO {
        private LocalDateTime fechaHora;
        private String categoria;
        private String accion;
        private String descripcion;
        private String actor;
        private String rolActor;
        private String valorAnterior;
        private String valorNuevo;
        private String motivo;
        private Boolean cumplimientoPlazo;
        private String origenFuente;
        private Long referenciaId;
    }
}
