package edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto;

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
public class SedeCatalogoDTO {
    private Long id;
    private Long empresaId;
    private String razonSocialEmpresa;
    private String nombreSede;
    private String tipoEntidad;
    private String direccion;
    private String departamento;
    private String provincia;
    private String distrito;
    private String areaDisponible;
    private String descripcion;
    private String estadoSede;
    private Integer capacidadMaxima;
    private Integer vacantesDisponibles;
    private Boolean activo;
    private String telefono;
    private String email;
    private String nombreContacto;
    private String cargoContacto;
    private String telefonoContacto;
    private String emailContacto;
    private String actividadesPrincipales;
    private String riesgosRelevantes;
    private String nombreTutorEmpresa;
    private String cargoTutorEmpresa;
    private String correoTutorEmpresa;
    private String telefonoTutorEmpresa;
    
    // Información de convenio
    private Boolean tieneConvenioVigente;
    private String estadoConvenio;
    private LocalDate fechaVigenciaConvenio;
    
    // Información de validación
    private Boolean tieneValidacionVigente;
    private String resultadoValidacion;
    private LocalDate fechaVigenciaValidacion;
    
    // Información de tutores
    private Boolean tieneTutorActivo;
    private Integer cantidadTutoresActivos;
    private List<TutorInfoDTO> tutoresActivos;
    
    // Elegibilidad
    private Boolean esElegible;
    private String motivoNoElegible;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TutorInfoDTO {
        private Long id;
        private String nombres;
        private String apellidoPaterno;
        private String apellidoMaterno;
        private String cargo;
        private String correo;
        private String telefono;
    }
}
