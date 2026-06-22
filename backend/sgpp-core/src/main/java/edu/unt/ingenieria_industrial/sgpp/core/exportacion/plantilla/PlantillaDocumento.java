package edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;

public interface PlantillaDocumento<T> {

    TipoDocumentoInstitucional getTipoDocumento();

    DocumentoRenderizable construir(T contexto);
}
