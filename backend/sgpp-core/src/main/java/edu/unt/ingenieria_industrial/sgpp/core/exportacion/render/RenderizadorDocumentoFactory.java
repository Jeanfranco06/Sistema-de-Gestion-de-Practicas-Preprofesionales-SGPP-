package edu.unt.ingenieria_industrial.sgpp.core.exportacion.render;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class RenderizadorDocumentoFactory {

    private final Map<FormatoExportacion, RenderizadorDocumento> renderizadores;

    public RenderizadorDocumentoFactory(List<RenderizadorDocumento> lista) {
        this.renderizadores = new EnumMap<>(FormatoExportacion.class);
        for (RenderizadorDocumento r : lista) {
            renderizadores.put(r.getFormato(), r);
        }
    }

    public RenderizadorDocumento obtener(FormatoExportacion formato) {
        RenderizadorDocumento renderizador = renderizadores.get(formato);
        if (renderizador == null) {
            throw new IllegalArgumentException("Formato de exportación no soportado: " + formato);
        }
        return renderizador;
    }
}
