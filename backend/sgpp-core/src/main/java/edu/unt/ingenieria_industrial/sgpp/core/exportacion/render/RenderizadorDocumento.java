package edu.unt.ingenieria_industrial.sgpp.core.exportacion.render;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;

public interface RenderizadorDocumento {

    FormatoExportacion getFormato();

    byte[] renderizar(DocumentoRenderizable documento);
}
