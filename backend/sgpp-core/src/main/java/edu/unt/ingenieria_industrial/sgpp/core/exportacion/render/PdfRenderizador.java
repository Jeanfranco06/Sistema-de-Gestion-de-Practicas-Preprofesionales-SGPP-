package edu.unt.ingenieria_industrial.sgpp.core.exportacion.render;

import com.lowagie.text.*;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfGState;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import com.lowagie.text.pdf.PdfWriter;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;

@Slf4j
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
            Document pdf = new Document(PageSize.A4, 40, 40, 110, 80);
            PdfWriter writer = PdfWriter.getInstance(pdf, baos);
            
            // Agregar pie de página personalizado
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override
                public void onEndPage(PdfWriter writer, Document document) {
                    try {
                        agregarPiePaginaInstitucional(writer, document);
                    } catch (Exception e) {
                        log.warn("Error al agregar pie de página: {}", e.getMessage());
                    }
                }
            });
            
            pdf.open();

            boolean tieneLogos = tieneLogos(documento.getMetadatos());
            boolean esCartaInstitucional = documento.getMetadatos().getTipoDocumento() != null && 
                (documento.getMetadatos().getTipoDocumento().contains("CARTA") || 
                 documento.getMetadatos().getTipoDocumento().contains("CONSTANCIA"));

            // Agregamos encabezado institucional SIEMPRE, incluso cuando hay logos!
            agregarEncabezadoInstitucional(pdf, documento.getMetadatos());
            
            // Solo agregar metadatos si NO es una carta institucional
            if (!esCartaInstitucional) {
                agregarMetadatosReporte(pdf, documento.getMetadatos());
            }

            for (DocumentoRenderizable.SeccionDocumento seccion : documento.getSecciones()) {
                renderizarSeccion(pdf, seccion);
            }

            // Solo agregar pie de trazabilidad si NO es una carta institucional
            if (!esCartaInstitucional) {
                agregarPieTrazabilidad(pdf, documento.getMetadatos());
            }
            
            pdf.close();

            if (tieneLogos) {
                byte[] contenido = baos.toByteArray();
                byte[] conLogos = agregarLogosYMarcaDeAgua(contenido, documento.getMetadatos());
                return conLogos;
            }

            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Error al generar PDF institucional", e);
        }
    }
    
    private void agregarPiePaginaInstitucional(PdfWriter writer, Document document) throws DocumentException {
        PdfContentByte cb = writer.getDirectContent();
        
        // Agregar línea azul superior del pie de página
        cb.setColorStroke(new Color(0, 102, 204));
        cb.setLineWidth(2);
        cb.moveTo(document.left(), document.bottom() - 20);
        cb.lineTo(document.right(), document.bottom() - 20);
        cb.stroke();
        
        // Agregar texto del pie de página
        ColumnText ct = new ColumnText(cb);
        Phrase phrase = new Phrase();
        Font fontPie = FontFactory.getFont(FontFactory.HELVETICA, 9);
        
        phrase.add(new Chunk("Av. Juan Pablo II S/N (Ciudad Universitaria)      ", fontPie));
        phrase.add(new Chunk("(044) 202866      ", fontPie));
        phrase.add(new Chunk("industrial@unitru.edu.pe", fontPie));
        
        ct.setSimpleColumn(document.left(), document.bottom() - 45, document.right(), document.bottom() - 10);
        ct.setAlignment(Element.ALIGN_CENTER);
        ct.addText(phrase);
        ct.go();
        
        // Agregar línea azul inferior del pie de página
        cb.setColorStroke(new Color(0, 102, 204));
        cb.setLineWidth(5);
        cb.moveTo(document.left(), document.bottom() - 50);
        cb.lineTo(document.right(), document.bottom() - 50);
        cb.stroke();
    }

    private boolean tieneLogos(DocumentoRenderizable.MetadatosDocumento meta) {
        return (meta.getLogoIzquierdaPath() != null && !meta.getLogoIzquierdaPath().isBlank())
                || (meta.getLogoDerechaPath() != null && !meta.getLogoDerechaPath().isBlank());
    }

    private byte[] agregarLogosYMarcaDeAgua(byte[] contenidoPdf, DocumentoRenderizable.MetadatosDocumento meta) throws Exception {
        ByteArrayOutputStream baosFinal = new ByteArrayOutputStream();
        PdfReader reader = new PdfReader(contenidoPdf);
        PdfStamper stamper = new PdfStamper(reader, baosFinal);
        PdfContentByte over;
        PdfContentByte under;

        int totalPaginas = reader.getNumberOfPages();

        for (int i = 1; i <= totalPaginas; i++) {
            Rectangle pageSize = reader.getPageSize(i);
            float pageWidth = pageSize.getWidth();
            float pageHeight = pageSize.getHeight();

            over = stamper.getOverContent(i);

            float logoHeight = 50;
            float logoWidthIzq = 70;
            float logoWidthDer = 50;
            float topY = pageHeight - 5;
            float leftX = 40;
            float rightX = pageWidth - 40 - logoWidthDer;

            if (meta.getLogoIzquierdaPath() != null && !meta.getLogoIzquierdaPath().isBlank()) {
                Image logoIzq = cargarImagen(meta.getLogoIzquierdaPath());
                if (logoIzq != null) {
                    logoIzq.scaleToFit(logoWidthIzq, logoHeight);
                    logoIzq.setAbsolutePosition(leftX, topY - logoHeight);
                    over.addImage(logoIzq);
                }
            }

            if (meta.getLogoDerechaPath() != null && !meta.getLogoDerechaPath().isBlank()) {
                Image logoDer = cargarImagen(meta.getLogoDerechaPath());
                if (logoDer != null) {
                    logoDer.scaleToFit(logoWidthDer, logoHeight);
                    logoDer.setAbsolutePosition(rightX, topY - logoHeight);
                    over.addImage(logoDer);
                }
            }

            if (i == 1 && meta.getMarcaDeAguaPath() != null && !meta.getMarcaDeAguaPath().isBlank()) {
                Image marcaDeAgua = cargarImagen(meta.getMarcaDeAguaPath());
                if (marcaDeAgua != null) {
                    float wmSize = 250;
                    marcaDeAgua.scaleToFit(wmSize, wmSize);
                    float wmX = (pageWidth - wmSize) / 2;
                    float wmY = (pageHeight - wmSize) / 2;

                    PdfGState gs = new PdfGState();
                    gs.setFillOpacity(0.08f);
                    gs.setStrokeOpacity(0.08f);

                    over.setGState(gs);
                    marcaDeAgua.setAbsolutePosition(wmX, wmY);
                    over.addImage(marcaDeAgua);
                }
            }

            PdfContentByte underContent = stamper.getUnderContent(i);
            Rectangle headerArea = new Rectangle(leftX, topY - logoHeight - 5, rightX + logoWidthDer, topY + 5);
            underContent.setColorStroke(Color.WHITE);
            underContent.rectangle(headerArea);
            underContent.fill();
        }

        stamper.close();
        reader.close();
        return baosFinal.toByteArray();
    }

    private Image cargarImagen(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    BufferedImage bimg = ImageIO.read(is);
                    if (bimg != null) {
                        return Image.getInstance(bimg, null);
                    }
                }
            }
            java.io.File file = new java.io.File(path);
            if (file.exists()) {
                return Image.getInstance(path);
            }
            log.warn("Imagen no encontrada: {}", path);
            return null;
        } catch (Exception e) {
            log.warn("Error cargando imagen {}: {}", path, e.getMessage());
            return null;
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
                    // Determinar la alineación
                    int alignment;
                    if (seccion.getAlineacion() == DocumentoRenderizable.Alineacion.CENTRO) {
                        alignment = Element.ALIGN_CENTER;
                    } else if (seccion.getAlineacion() == DocumentoRenderizable.Alineacion.DERECHA) {
                        alignment = Element.ALIGN_RIGHT;
                    } else if (seccion.getAlineacion() == DocumentoRenderizable.Alineacion.JUSTIFICADO) {
                        alignment = Element.ALIGN_JUSTIFIED;
                    } else {
                        // IZQUIERDA: alineación izquierda
                        alignment = Element.ALIGN_LEFT;
                    }
                    
                    String[] lineas = seccion.getContenidoTexto().split("\n");
                    for (String linea : lineas) {
                        Paragraph p = new Paragraph(linea, FONT_NORMAL);
                        p.setAlignment(alignment);
                        p.setSpacingAfter(4);
                        pdf.add(p);
                    }
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
        table.setSpacingBefore(8);
        table.setSpacingAfter(12);
        for (Map.Entry<String, String> entry : campos.entrySet()) {
            String valorCampo = valor(entry.getValue());
            if (valorCampo == null || valorCampo.isBlank() || valorCampo.equals("—")) {
                // Si el valor está vacío, usar una celda de ancho completo para la etiqueta
                PdfPCell fullCell = new PdfPCell(new Phrase(entry.getKey(), FONT_TITULO));
                fullCell.setColspan(2);
                fullCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                fullCell.setPadding(8);
                fullCell.setBorder(Rectangle.NO_BORDER);
                table.addCell(fullCell);
            } else {
                PdfPCell label = new PdfPCell(new Phrase(entry.getKey(), FONT_SUBTITULO));
                label.setBackgroundColor(new Color(240, 240, 240));
                label.setPadding(6);
                label.setBorderWidth(1);
                label.setBorderColor(new Color(200, 200, 200));
                PdfPCell value = new PdfPCell(new Phrase(valorCampo, FONT_NORMAL));
                value.setPadding(6);
                value.setBorderWidth(1);
                value.setBorderColor(new Color(200, 200, 200));
                table.addCell(label);
                table.addCell(value);
            }
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
