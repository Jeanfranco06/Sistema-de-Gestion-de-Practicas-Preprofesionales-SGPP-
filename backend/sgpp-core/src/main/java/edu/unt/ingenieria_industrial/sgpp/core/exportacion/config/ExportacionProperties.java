package edu.unt.ingenieria_industrial.sgpp.core.exportacion.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@Getter
public class ExportacionProperties {

    @Value("${sgpp.exportacion.directorio:./data/exportaciones}")
    private String directorioBase;

    @Value("${sgpp.exportacion.institucion:Universidad Nacional de Trujillo}")
    private String nombreInstitucion;

    @Value("${sgpp.exportacion.unidad-academica:Escuela de Ingeniería Industrial}")
    private String unidadAcademica;

    @Value("${sgpp.exportacion.facultad:Facultad de Ingeniería}")
    private String facultad;

    @Value("${sgpp.exportacion.ciudad:Trujillo}")
    private String ciudad;

    @Value("${sgpp.exportacion.ruc:20172557628}")
    private String rucInstitucion;

    @Value("${sgpp.exportacion.razon-social:Universidad Nacional de Trujillo}")
    private String razonSocialInstitucion;

    @Value("${sgpp.exportacion.direccion:Av. Juan Pablo II S/N. Ciudad Universitaria}")
    private String direccionInstitucion;

    @Value("${sgpp.exportacion.director.nombre:}")
    private String directorNombre;

    @Value("${sgpp.exportacion.director.dni:}")
    private String directorDni;

    @Value("${sgpp.exportacion.carta.presentacion.prefijo:083-2025-EPI}")
    private String prefijoCartaPresentacion;

    @Value("${sgpp.exportacion.horas-minimas-practica:360}")
    private int horasMinimasPractica;

    @Value("${sgpp.exportacion.img.logo-izquierda:templates/img/logo_izquierda.png}")
    private String logoIzquierdaPath;

    @Value("${sgpp.exportacion.img.logo-derecha:templates/img/logo_derecha.jpg}")
    private String logoDerechaPath;

    @Value("${sgpp.exportacion.img.marca-agua:templates/img/logo_marca_agua.png}")
    private String marcaDeAguaPath;

    public Path resolverDirectorio() {
        return Paths.get(directorioBase);
    }
}
