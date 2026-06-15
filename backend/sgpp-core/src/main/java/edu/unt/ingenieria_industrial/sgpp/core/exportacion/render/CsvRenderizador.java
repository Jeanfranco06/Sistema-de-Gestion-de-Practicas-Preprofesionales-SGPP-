package edu.unt.ingenieria_industrial.sgpp.core.exportacion.render;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class CsvRenderizador implements RenderizadorDocumento {

    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final byte[] UTF8_BOM = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};

    @Override
    public FormatoExportacion getFormato() {
        return FormatoExportacion.CSV;
    }

    @Override
    public byte[] renderizar(DocumentoRenderizable documento) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT)) {

            baos.write(UTF8_BOM);
            var meta = documento.getMetadatos();

            printer.printRecord("# SGPP - Exportación institucional");
            printer.printRecord("Titulo", meta.getTitulo());
            printer.printRecord("Tipo documento", meta.getTipoDocumento());
            printer.printRecord("Tipo reporte", meta.getTipoReporte());
            printer.printRecord("Periodo consultado", meta.getPeriodoConsultado());
            printer.printRecord("Filtros aplicados", meta.getFiltrosDescripcion());
            printer.printRecord("Generado por", meta.getGeneradoPor());
            if (meta.getFechaGeneracion() != null) {
                printer.printRecord("Fecha generacion", meta.getFechaGeneracion().format(FECHA_HORA));
            }
            printer.printRecord("Codigo trazabilidad", meta.getCodigoTrazabilidad());
            printer.printRecord("");

            for (DocumentoRenderizable.SeccionDocumento seccion : documento.getSecciones()) {
                if (seccion.getTitulo() != null) {
                    printer.printRecord("# " + seccion.getTitulo());
                }
                switch (seccion.getTipo()) {
                    case TEXTO -> {
                        if (seccion.getContenidoTexto() != null) {
                            printer.printRecord(seccion.getContenidoTexto());
                        }
                    }
                    case CAMPOS -> imprimirCampos(printer, seccion.getCampos());
                    case TABLA -> imprimirTabla(printer, seccion.getEncabezados(), seccion.getFilas());
                }
                printer.printRecord("");
            }

            printer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Error al generar CSV institucional", e);
        }
    }

    private void imprimirCampos(CSVPrinter printer, Map<String, String> campos) throws java.io.IOException {
        if (campos == null) return;
        printer.printRecord("Campo", "Valor");
        for (Map.Entry<String, String> e : campos.entrySet()) {
            printer.printRecord(e.getKey(), e.getValue() != null ? e.getValue() : "");
        }
    }

    private void imprimirTabla(CSVPrinter printer, List<String> encabezados, List<List<String>> filas)
            throws java.io.IOException {
        if (encabezados == null || encabezados.isEmpty()) return;
        printer.printRecord(encabezados);
        if (filas != null) {
            for (List<String> fila : filas) {
                List<String> filaCompleta = new ArrayList<>();
                for (int i = 0; i < encabezados.size(); i++) {
                    filaCompleta.add(i < fila.size() && fila.get(i) != null ? fila.get(i) : "");
                }
                printer.printRecord(filaCompleta);
            }
        }
    }
}
