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

    public Path resolverDirectorio() {
        return Paths.get(directorioBase);
    }
}
