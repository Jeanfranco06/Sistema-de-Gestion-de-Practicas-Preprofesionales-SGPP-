package edu.unt.ingenieria_industrial.sgpp.core.exportacion.render;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
public class PdfRenderizador implements RenderizadorDocumento {

    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Font FONT_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font FONT_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
    private static final Font FONT_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font FONT_PEQUENA = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);
    private static final Font FONT_ENCABEZADO_TABLA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);

    @Override
    public FormatoExportacion getFormato() {
        return FormatoExportacion.PDF;
    }

    @Override
    public byte[] renderizar(DocumentoRenderizable documento) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document pdf = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(pdf, baos);
            pdf.open();

            agregarEncabezadoInstitucional(pdf, documento.getMetadatos());
            agregarMetadatosReporte(pdf, documento.getMetadatos());

            for (DocumentoRenderizable.SeccionDocumento seccion : documento.getSecciones()) {
                renderizarSeccion(pdf, seccion);
            }

            agregarPieTrazabilidad(pdf, documento.getMetadatos());
            pdf.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Error al generar PDF institucional", e);
        }
    }

    private void agregarEncabezadoInstitucional(Document pdf, DocumentoRenderizable.MetadatosDocumento meta) throws DocumentException {
        if (meta.getInstitucion() != null) {
            Paragraph inst = new Paragraph(meta.getInstitucion(), FONT_SUBTITULO);
            inst.setAlignment(Element.ALIGN_CENTER);
            pdf.add(inst);
        }
        if (meta.getUnidadAcademica() != null) {
            Paragraph unidad = new Paragraph(meta.getUnidadAcademica(), FONT_NORMAL);
            unidad.setAlignment(Element.ALIGN_CENTER);
            pdf.add(unidad);
        }
        if (meta.getTitulo() != null) {
            Paragraph titulo = new Paragraph(meta.getTitulo(), FONT_TITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingBefore(12);
            titulo.setSpacingAfter(4);
            pdf.add(titulo);
        }
        if (meta.getSubtitulo() != null) {
            Paragraph sub = new Paragraph(meta.getSubtitulo(), FONT_NORMAL);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(10);
            pdf.add(sub);
        }
        pdf.add(new Paragraph(" "));
    }

    private void agregarMetadatosReporte(Document pdf, DocumentoRenderizable.MetadatosDocumento meta) throws DocumentException {
        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(100);
        metaTable.setSpacingAfter(10);

        agregarCeldaMeta(metaTable, "Tipo documento", valor(meta.getTipoDocumento()));
        agregarCeldaMeta(metaTable, "Periodo consultado", valor(meta.getPeriodoConsultado()));
        agregarCeldaMeta(metaTable, "Filtros aplicados", valor(meta.getFiltrosDescripcion()));
        agregarCeldaMeta(metaTable, "Generado por", valor(meta.getGeneradoPor()));
        if (meta.getFechaGeneracion() != null) {
            agregarCeldaMeta(metaTable, "Fecha de generación", meta.getFechaGeneracion().format(FECHA_HORA));
        }
        if (meta.getCodigoTrazabilidad() != null) {
            agregarCeldaMeta(metaTable, "Código trazabilidad", meta.getCodigoTrazabilidad());
        }
        pdf.add(metaTable);
    }

    private void renderizarSeccion(Document pdf, DocumentoRenderizable.SeccionDocumento seccion) throws DocumentException {
        if (seccion.getTitulo() != null) {
            Paragraph tituloSeccion = new Paragraph(seccion.getTitulo(), FONT_SUBTITULO);
            tituloSeccion.setSpacingBefore(8);
            tituloSeccion.setSpacingAfter(6);
            pdf.add(tituloSeccion);
        }

        switch (seccion.getTipo()) {
            case TEXTO -> {
                if (seccion.getContenidoTexto() != null) {
                    Paragraph p = new Paragraph(seccion.getContenidoTexto(), FONT_NORMAL);
                    p.setAlignment(Element.ALIGN_JUSTIFIED);
                    p.setSpacingAfter(8);
                    pdf.add(p);
                }
            }
            case CAMPOS -> agregarCampos(pdf, seccion.getCampos());
            case TABLA -> agregarTabla(pdf, seccion.getEncabezados(), seccion.getFilas());
        }
    }

    private void agregarCampos(Document pdf, Map<String, String> campos) throws DocumentException {
        if (campos == null || campos.isEmpty()) return;
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(10);
        for (Map.Entry<String, String> entry : campos.entrySet()) {
            PdfPCell label = new PdfPCell(new Phrase(entry.getKey(), FONT_SUBTITULO));
            label.setBackgroundColor(new Color(240, 240, 240));
            label.setPadding(5);
            PdfPCell value = new PdfPCell(new Phrase(valor(entry.getValue()), FONT_NORMAL));
            value.setPadding(5);
            table.addCell(label);
            table.addCell(value);
        }
        pdf.add(table);
    }

    private void agregarTabla(Document pdf, List<String> encabezados, List<List<String>> filas) throws DocumentException {
        if (encabezados == null || encabezados.isEmpty()) return;
        PdfPTable table = new PdfPTable(encabezados.size());
        table.setWidthPercentage(100);
        table.setSpacingAfter(12);

        for (String enc : encabezados) {
            PdfPCell cell = new PdfPCell(new Phrase(enc, FONT_ENCABEZADO_TABLA));
            cell.setBackgroundColor(new Color(41, 65, 114));
            cell.setPadding(5);
            table.addCell(cell);
        }

        if (filas != null) {
            boolean alternar = false;
            for (List<String> fila : filas) {
                Color bg = alternar ? new Color(245, 245, 245) : Color.WHITE;
                for (int i = 0; i < encabezados.size(); i++) {
                    String valor = i < fila.size() ? fila.get(i) : "";
                    PdfPCell cell = new PdfPCell(new Phrase(valor(valor), FONT_NORMAL));
                    cell.setBackgroundColor(bg);
                    cell.setPadding(4);
                    table.addCell(cell);
                }
                alternar = !alternar;
            }
        }
        pdf.add(table);
    }

    private void agregarPieTrazabilidad(Document pdf, DocumentoRenderizable.MetadatosDocumento meta) throws DocumentException {
        Paragraph pie = new Paragraph(
                "Documento generado por el Sistema de Gestión de Prácticas Preprofesionales (SGPP). "
                        + "Uso institucional. " + (meta.getCodigoTrazabilidad() != null
                        ? "Ref: " + meta.getCodigoTrazabilidad() : ""),
                FONT_PEQUENA);
        pie.setAlignment(Element.ALIGN_CENTER);
        pie.setSpacingBefore(20);
        pdf.add(pie);
    }

    private void agregarCeldaMeta(PdfPTable table, String label, String value) {
        PdfPCell l = new PdfPCell(new Phrase(label, FONT_PEQUENA));
        l.setBorder(Rectangle.NO_BORDER);
        PdfPCell v = new PdfPCell(new Phrase(value, FONT_NORMAL));
        v.setBorder(Rectangle.NO_BORDER);
        table.addCell(l);
        table.addCell(v);
    }

    private String valor(String s) {
        return s != null && !s.isBlank() ? s : "—";
    }
}
