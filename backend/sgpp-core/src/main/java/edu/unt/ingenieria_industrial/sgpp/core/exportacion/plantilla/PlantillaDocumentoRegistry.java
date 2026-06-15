package edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class PlantillaDocumentoRegistry {

    private final Map<TipoDocumentoInstitucional, PlantillaDocumento<?>> plantillas;

    public PlantillaDocumentoRegistry(List<PlantillaDocumento<?>> lista) {
        this.plantillas = new EnumMap<>(TipoDocumentoInstitucional.class);
        for (PlantillaDocumento<?> p : lista) {
            plantillas.put(p.getTipoDocumento(), p);
        }
    }

    @SuppressWarnings("unchecked")
    public <T> PlantillaDocumento<T> obtener(TipoDocumentoInstitucional tipo) {
        PlantillaDocumento<?> plantilla = plantillas.get(tipo);
        if (plantilla == null) {
            throw new BusinessException("Plantilla no registrada para: " + tipo);
        }
        return (PlantillaDocumento<T>) plantilla;
    }
}
