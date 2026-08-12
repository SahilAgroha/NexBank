package com.fintech.invoice.service;

import com.fintech.invoice.entity.Invoice;
import com.fintech.invoice.entity.InvoiceItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class InvoicePdfGenerator {

    public byte[] generateInvoicePdf(Invoice invoice) throws IOException, DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        
        document.open();
        
        // Header
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
        Paragraph title = new Paragraph("INVOICE", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        document.add(new Paragraph("\n"));
        
        // Invoice Details
        document.add(new Paragraph("Invoice Number: " + invoice.getInvoiceNumber()));
        document.add(new Paragraph("Date: " + invoice.getCreatedAt().toLocalDate().toString()));
        document.add(new Paragraph("Status: " + invoice.getStatus()));
        document.add(new Paragraph("\n"));
        
        // Customer Details
        document.add(new Paragraph("Bill To:"));
        document.add(new Paragraph("Email: " + invoice.getUser().getEmail()));
        document.add(new Paragraph("\n"));
        
        // Items Table
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4f, 2f, 2f, 2f});
        
        addTableHeader(table, "Service Description");
        addTableHeader(table, "Quantity");
        addTableHeader(table, "Unit Price");
        addTableHeader(table, "Total");
        
        for (InvoiceItem item : invoice.getItems()) {
            addTableCell(table, item.getServiceName());
            addTableCell(table, String.valueOf(item.getQuantity()));
            addTableCell(table, "Rs. " + item.getUnitPrice());
            addTableCell(table, "Rs. " + item.getTotalPrice());
        }
        
        document.add(table);
        document.add(new Paragraph("\n"));
        
        // Totals
        Paragraph subtotal = new Paragraph("Subtotal: Rs. " + invoice.getSubtotal());
        subtotal.setAlignment(Element.ALIGN_RIGHT);
        document.add(subtotal);
        
        Paragraph tax = new Paragraph("Tax (18% GST): Rs. " + invoice.getTaxAmount());
        tax.setAlignment(Element.ALIGN_RIGHT);
        document.add(tax);
        
        Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph total = new Paragraph("Total Amount: Rs. " + invoice.getTotalAmount(), totalFont);
        total.setAlignment(Element.ALIGN_RIGHT);
        document.add(total);
        
        document.close();
        
        return out.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String headerTitle) {
        PdfPCell header = new PdfPCell();
        header.setPadding(5);
        header.setPhrase(new Phrase(headerTitle, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        table.addCell(header);
    }
    
    private void addTableCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setPadding(5);
        table.addCell(cell);
    }
}
