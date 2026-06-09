package edu.unt.ingenieria_industrial.sgpp.core.empresarial.service;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import java.util.List;

public interface SedeElegibilidadService {
    ResultadoElegibilidad evaluarElegibilidad(Long sedeId);
    ResultadoElegibilidad evaluarElegibilidad(SedePractica sede);

    class ResultadoElegibilidad {
        private final boolean elegible;
        private final List<String> motivosRechazo;

        public ResultadoElegibilidad(boolean elegible, List<String> motivosRechazo) {
            this.elegible = elegible;
            this.motivosRechazo = motivosRechazo;
        }

        public boolean isElegible() { return elegible; }
        public List<String> getMotivosRechazo() { return motivosRechazo; }

        public String getMotivoResumen() {
            if (elegible) return null;
            return String.join("; ", motivosRechazo);
        }
    }
}
