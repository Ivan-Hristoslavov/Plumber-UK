import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { supabase } from "@/lib/supabase";
import { createPaymentLink, isStripeAvailable } from "@/lib/stripe";
import { sendEmail, EmailAttachment } from "@/lib/sendgrid-smtp";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { join } from "path";

// POST - Send invoice email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { includePaymentLink = false, currency = "gbp" } = body;

    console.log("Sending invoice email for ID:", id);

    // Get invoice details with better error handling
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, email, address, phone),
        booking:bookings(service, date, time, notes)
      `
      )
      .eq("id", id)
      .single();

    console.log("Invoice query result:", { invoice, error: invoiceError });

    if (invoiceError) {
      console.error("Invoice query error:", invoiceError);
      return NextResponse.json(
        { error: `Invoice not found: ${invoiceError.message}` },
        { status: 404 }
      );
    }

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (!invoice.customer?.email) {
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 400 }
      );
    }

    // Parse image attachments if they exist
    let imageAttachments: { filename: string; path: string }[] = [];
    if (invoice.image_attachments) {
      try {
        imageAttachments = JSON.parse(invoice.image_attachments);
      } catch (error) {
        console.error("Error parsing image attachments:", error);
      }
    }

    // Create Stripe payment link if requested
    let paymentLink = null;
    if (includePaymentLink && isStripeAvailable()) {
      try {
        const paymentLinkData = await createPaymentLink({
          amount: invoice.total_amount,
          currency: currency,
          description: `Invoice ${invoice.invoice_number} - ${invoice.booking?.service || invoice.manual_service || 'Plumbing Service'}`,
          customerEmail: invoice.customer.email,
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            customer_id: invoice.customer_id,
            currency: currency,
          },
        });
        
        paymentLink = paymentLinkData.url;
        console.log("Created payment link with pre-filled email:", paymentLink);
        console.log("Customer email:", invoice.customer.email);
      } catch (stripeError) {
        console.error("Error creating Stripe payment link:", stripeError);
        return NextResponse.json(
          { error: `Failed to create payment link: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    } else if (includePaymentLink && !isStripeAvailable()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please check your environment variables." },
        { status: 503 }
      );
    }

    // Generate PDF invoice
    const pdfBuffer = generateInvoicePDF(invoice);
    
    // Prepare email attachments from images and PDF
    const emailAttachments: EmailAttachment[] = [];
    
    // Add PDF invoice as attachment
    emailAttachments.push({
      filename: `Invoice-${invoice.invoice_number}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });
    
    for (const attachment of imageAttachments) {
      try {
        console.log(`Attempting to read attachment: ${attachment.filename} from path: ${attachment.path}`);
        
        // Convert relative path to absolute path
        const absolutePath = attachment.path.startsWith('/') 
          ? join(process.cwd(), 'public', attachment.path)
          : attachment.path;
        
        console.log(`Absolute path: ${absolutePath}`);
        
        // Check if path exists and is accessible
        const fs = require('fs');
        if (!fs.existsSync(absolutePath)) {
          console.error(`File does not exist: ${absolutePath}`);
          continue;
        }

        const fileContent = await readFile(absolutePath);
        const contentType = getContentType(attachment.filename);
        
        console.log(`Successfully read file: ${attachment.filename}, size: ${fileContent.length} bytes`);
        
        emailAttachments.push({
          filename: attachment.filename,
          content: fileContent,
          contentType: contentType
        });
      } catch (error) {
        console.error(`Error reading attachment ${attachment.filename}:`, error);
        console.error(`Attempted path: ${attachment.path}`);
        // Continue with other attachments if one fails
      }
    }

    console.log(`Total attachments prepared: ${emailAttachments.length} (including PDF)`);

    // Prepare email content
    const emailSubject = `Invoice ${invoice.invoice_number} from ${invoice.company_name}`;
    const emailBody = generateEmailBody(invoice, paymentLink, imageAttachments.length > 0, currency);
    const emailHtml = generateEmailHtml(invoice, paymentLink, imageAttachments.length > 0, currency);

    // Send email via SendGrid
    try {
      console.log(`Sending email to: ${invoice.customer.email} with ${emailAttachments.length} attachments`);
      
      await sendEmail({
        to: invoice.customer.email,
        subject: emailSubject,
        text: emailBody,
        html: emailHtml,
        attachments: emailAttachments
      });

      console.log("Email sent successfully to:", invoice.customer.email);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      // Try sending without attachments if there's an attachment-related error
      if (emailAttachments.length > 0) {
        console.log("Attempting to send email without attachments...");
        try {
          await sendEmail({
            to: invoice.customer.email,
            subject: emailSubject,
            text: emailBody + "\n\nNote: Attachments could not be included due to technical issues.",
            html: emailHtml.replace('Please see the attached images', 'Images were not included due to technical issues'),
            attachments: []
          });
          
          console.log("Email sent successfully without attachments");
          
          return NextResponse.json({
            message: "Invoice email sent successfully (without attachments due to technical issues)",
            recipient: invoice.customer.email,
            paymentLink: paymentLink,
            attachments: 0,
            currency: currency,
            warning: "Attachments could not be included"
          });
        } catch (secondError) {
          console.error("Error sending email even without attachments:", secondError);
          return NextResponse.json(
            { error: `Failed to send email: ${secondError instanceof Error ? secondError.message : 'Unknown error'}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Failed to send email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Update invoice status to 'sent' and set sent_date
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "sent",
        sent_date: new Date().toISOString().split('T')[0],
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating invoice status:", updateError);
      return NextResponse.json(
        { error: "Failed to update invoice status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Invoice email sent successfully",
      recipient: invoice.customer.email,
      paymentLink: paymentLink,
      attachments: emailAttachments.length,
      currency: currency,
    });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

function generateInvoicePDF(invoice: any): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Consistent spacing constants
  const spacing = {
    margin: 40,
    headerHeight: 90,
    sectionGap: 25,
    lineSpacing: 16,
    smallSpacing: 8,
    mediumSpacing: 12,
    largeSpacing: 20,
    tableRowHeight: 45,
    tableHeaderHeight: 35,
  };
  
  let y = spacing.margin;

  // Professional header with gradient-like effect
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, pageWidth, spacing.headerHeight, "F");
  
  // Add subtle secondary color strip
  doc.setFillColor(29, 78, 216); // Darker blue
  doc.rect(0, spacing.headerHeight - 8, pageWidth, 8, "F");
  
  // Company name with perfect positioning
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.company_name || "FixMyLeak", spacing.margin, 45);
  
  // Professional tagline
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Plumbing & Heating Services", spacing.margin, 68);

  // Invoice title section
  y = spacing.headerHeight + spacing.sectionGap;
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 140, y);
  
  // Invoice metadata with consistent spacing
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  y += spacing.sectionGap;
  doc.text(`Invoice #${invoice.invoice_number}`, pageWidth - 160, y);
  y += spacing.lineSpacing;
  doc.text(`Date: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, pageWidth - 160, y);
  if (invoice.due_date) {
    y += spacing.lineSpacing;
    doc.text(`Due: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, pageWidth - 160, y);
  }

  // Company details section
  let companyY = spacing.headerHeight + spacing.sectionGap;
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text("From:", spacing.margin, companyY);
  
  companyY += spacing.largeSpacing;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.text(invoice.company_name || "FixMyLeak", spacing.margin, companyY);
  
  companyY += spacing.largeSpacing;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  
  // Company address with proper spacing
  const addressLines = (invoice.company_address || "London, UK").split('\n');
  addressLines.forEach((line: string) => {
    if (line.trim()) {
      doc.text(line.trim(), spacing.margin, companyY);
      companyY += spacing.mediumSpacing;
    }
  });
  
  // Contact details with consistent spacing
  companyY += spacing.smallSpacing;
  doc.text(`Tel: ${invoice.company_phone || "+44 7700 123456"}`, spacing.margin, companyY);
  companyY += spacing.mediumSpacing;
  doc.text(`Email: ${invoice.company_email || "admin@fixmyleak.com"}`, spacing.margin, companyY);
  
  // VAT number
  if (invoice.company_vat_number) {
    companyY += spacing.mediumSpacing;
    doc.text(`VAT Reg: ${invoice.company_vat_number}`, spacing.margin, companyY);
  }

  // Customer details section (right side) - improved positioning
  let customerY = spacing.headerHeight + spacing.sectionGap;
  const customerX = pageWidth - 220; // Moved further left to avoid overlap
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Bill To:", customerX, customerY);
  
  customerY += spacing.largeSpacing;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12); // Slightly smaller font
  doc.setTextColor(37, 99, 235);
  
  // Wrap customer name if too long
  const customerName = invoice.customer?.name || "Customer";
  const maxCustomerWidth = 180;
  const wrappedCustomerName = doc.splitTextToSize(customerName, maxCustomerWidth);
  doc.text(wrappedCustomerName, customerX, customerY);
  customerY += (wrappedCustomerName.length * 12) + spacing.smallSpacing;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  
  if (invoice.customer?.email) {
    // Wrap email if too long
    const wrappedEmail = doc.splitTextToSize(invoice.customer.email, maxCustomerWidth);
    doc.text(wrappedEmail, customerX, customerY);
    customerY += (wrappedEmail.length * 10) + spacing.smallSpacing;
  }
  
  if (invoice.customer?.address) {
    const customerAddressLines = invoice.customer.address.split('\n');
    customerAddressLines.forEach((line: string) => {
      if (line.trim()) {
        // Wrap address lines if too long
        const wrappedLine = doc.splitTextToSize(line.trim(), maxCustomerWidth);
        doc.text(wrappedLine, customerX, customerY);
        customerY += (wrappedLine.length * 10) + spacing.smallSpacing;
      }
    });
  }

  // Service table section - ensure enough space from above content
  const tableY = Math.max(companyY, customerY) + spacing.sectionGap * 2;
  
  // Table header with professional styling
  doc.setFillColor(248, 250, 252);
  doc.rect(spacing.margin, tableY, pageWidth - (spacing.margin * 2), spacing.tableHeaderHeight, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.rect(spacing.margin, tableY, pageWidth - (spacing.margin * 2), spacing.tableHeaderHeight);
  
  // Table headers
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text("DESCRIPTION", spacing.margin + 15, tableY + 22);
  doc.text("DATE", pageWidth - 180, tableY + 22);
  doc.text("AMOUNT", pageWidth - 80, tableY + 22, { align: "right" });
  
  // Service row
  const serviceRowY = tableY + spacing.tableHeaderHeight;
  doc.setFillColor(255, 255, 255);
  doc.rect(spacing.margin, serviceRowY, pageWidth - (spacing.margin * 2), spacing.tableRowHeight, "F");
  doc.setDrawColor(229, 231, 235);
  doc.rect(spacing.margin, serviceRowY, pageWidth - (spacing.margin * 2), spacing.tableRowHeight);
  
  // Service content with text wrapping
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  const serviceText = invoice.booking?.service || invoice.manual_description || "Professional Plumbing Service";
  
  // Wrap text if too long
  const maxWidth = pageWidth - 300; // Leave space for date and amount columns
  const wrappedServiceText = doc.splitTextToSize(serviceText, maxWidth);
  doc.text(wrappedServiceText, spacing.margin + 15, serviceRowY + 18);
  
  if (invoice.booking?.date) {
    doc.setTextColor(75, 85, 99);
    doc.text(format(new Date(invoice.booking.date), "dd/MM/yyyy"), pageWidth - 180, serviceRowY + 18);
  }
  
  // Location with proper spacing - moved down to avoid overlap
  if (invoice.customer?.address) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    const location = invoice.customer.address.split('\n')[0];
    const locationY = serviceRowY + 18 + (wrappedServiceText.length * 12); // Dynamic positioning based on service text height
    
    if (location && location.length > 50) {
      const wrappedLocation = doc.splitTextToSize(`Location: ${location}`, maxWidth);
      doc.text(wrappedLocation, spacing.margin + 15, locationY);
    } else {
      doc.text(`Location: ${location}`, spacing.margin + 15, locationY);
    }
  }
  
  // Amount
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 80, serviceRowY + 18, { align: "right" });

  // Totals section with perfect spacing
  const totalsY = serviceRowY + spacing.tableRowHeight + spacing.sectionGap * 2;
  const totalsX = pageWidth - 180;
  
  // Subtotal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text("Subtotal (excl. VAT)", totalsX, totalsY);
  doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 40, totalsY, { align: "right" });
  
  // VAT
  const vatY = totalsY + spacing.lineSpacing;
  doc.text(`VAT @ ${invoice.vat_rate}%`, totalsX, vatY);
  doc.text(`£${invoice.vat_amount.toFixed(2)}`, pageWidth - 40, vatY, { align: "right" });
  
  // Total with emphasis
  const totalY = vatY + spacing.sectionGap;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(totalsX, totalY - 8, pageWidth - spacing.margin, totalY - 8);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.text("TOTAL", totalsX, totalY);
  doc.text(`£${invoice.total_amount.toFixed(2)}`, pageWidth - 40, totalY, { align: "right" });

  // Payment terms section
  const termsY = totalY + spacing.sectionGap * 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("Payment Terms", spacing.margin, termsY);
  
  let currentTermsY = termsY + spacing.largeSpacing;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  
  const paymentTerms = [
    "Payment due within 30 days of invoice date",
    "Late payment charges may apply after due date",
    "Bank transfer preferred - details available on request"
  ];
  
  paymentTerms.forEach((term: string) => {
    doc.text(`• ${term}`, spacing.margin, currentTermsY);
    currentTermsY += spacing.lineSpacing;
  });

  // Notes section with proper spacing
  if (invoice.notes && invoice.notes.trim()) {
    const notesY = currentTermsY + spacing.sectionGap;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("Additional Notes", spacing.margin, notesY);
    
    let currentNotesY = notesY + spacing.largeSpacing;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    
    const noteLines = invoice.notes.split('\n');
    noteLines.forEach((line: string) => {
      if (line.trim()) {
        doc.text(line.trim(), spacing.margin, currentNotesY);
        currentNotesY += spacing.lineSpacing;
      }
    });
  }

  // Professional footer
  const footerY = pageHeight - 60;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(spacing.margin, footerY - 20, pageWidth - spacing.margin, footerY - 20);
  
  // Footer content
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  
  let footerText = `${invoice.company_name || "FixMyLeak"} • ${invoice.company_address || "London, UK"}`;
  if (invoice.company_vat_number) {
    footerText += ` • VAT: ${invoice.company_vat_number}`;
  }
  
  doc.text(footerText, pageWidth / 2, footerY - 5, { align: "center" });
  doc.text("Thank you for choosing our professional services", pageWidth / 2, footerY + 8, { align: "center" });

  // Return PDF as buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

function generateEmailBody(invoice: any, paymentLink: string | null, hasAttachments: boolean, currency: string): string {
  const customerName = invoice.customer?.name || "Valued Customer";
  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString("en-GB");
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-GB") : "Upon receipt";
  
  // Currency symbol mapping
  const currencySymbols: Record<string, string> = {
    gbp: "£",
    usd: "$",
    eur: "€",
    cad: "C$",
    aud: "A$",
  };
  
  const currencySymbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();

  return `
Dear ${customerName},

Thank you for choosing ${invoice.company_name} for your plumbing needs.

Please find attached your invoice PDF and details for the services provided:

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Invoice Date: ${invoiceDate}
- Due Date: ${dueDate}
- Service: ${invoice.booking?.service || invoice.manual_service || 'Plumbing Service'}
- Total Amount: ${currencySymbol}${invoice.total_amount.toFixed(2)}

${invoice.notes ? `Additional Notes:\n${invoice.notes}\n\n` : ''}

${hasAttachments ? 'Please see the attached images related to the work completed.\n\n' : ''}

Payment Information:
${paymentLink ? 
  `You can pay this invoice online using the secure payment link below:\n${paymentLink}\n\nThis link accepts payments in ${currency.toUpperCase()} and is valid for 24 hours. Your email address will be pre-filled for your convenience.\n\n` : 
  `Please arrange payment within 30 days of the invoice date.\n\n`
}

Alternative payment methods:
- Bank transfer (details available on request)
- Cheque payable to: ${invoice.company_name}

If you have any questions about this invoice or our services, please don't hesitate to contact us:

${invoice.company_name}
${invoice.company_address}
Phone: ${invoice.company_phone}
Email: ${invoice.company_email}

Thank you for your business!

Best regards,
${invoice.company_name} Team
  `.trim();
}

function generateEmailHtml(invoice: any, paymentLink: string | null, hasAttachments: boolean, currency: string): string {
  const customerName = invoice.customer?.name || "Valued Customer";
  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString("en-GB");
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-GB") : "Upon receipt";
  
  // Currency symbol mapping
  const currencySymbols: Record<string, string> = {
    gbp: "£",
    usd: "$",
    eur: "€",
    cad: "C$",
    aud: "A$",
  };
  
  const currencySymbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .invoice-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .amount { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .payment-link { background-color: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .contact-info { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${invoice.company_name}</h1>
        <p>Professional Plumbing Services</p>
    </div>
    
    <div class="content">
        <h2>Dear ${customerName},</h2>
        
        <p>Thank you for choosing ${invoice.company_name} for your plumbing needs.</p>
        
        <p>Please find your invoice PDF attached and details below:</p>
        
        <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Service:</strong> ${invoice.booking?.service || invoice.manual_service || 'Plumbing Service'}</p>
            <p><strong>Total Amount:</strong> <span class="amount">${currencySymbol}${invoice.total_amount.toFixed(2)}</span></p>
        </div>
        
        ${invoice.notes ? `<div class="invoice-details">
            <h3>Additional Notes:</h3>
            <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
        ${hasAttachments ? '<p><strong>Note:</strong> Please see the attached images related to the work completed.</p>' : ''}
        
        <div class="invoice-details">
            <h3>Payment Information:</h3>
            ${paymentLink ? 
              `            <p>You can pay this invoice online using the secure payment link below:</p>
               <a href="${paymentLink}" class="payment-link">Pay Invoice Online (${currency.toUpperCase()})</a>
               <p><small>This link accepts payments in ${currency.toUpperCase()} and is valid for 24 hours. Your email address will be pre-filled for your convenience.</small></p>` : 
              '<p>Please arrange payment within 30 days of the invoice date.</p>'
            }
            
            <h4>Alternative payment methods:</h4>
            <ul>
                <li>Bank transfer (details available on request)</li>
                <li>Cheque payable to: ${invoice.company_name}</li>
            </ul>
        </div>
        
        <div class="contact-info">
            <h3>Contact Information:</h3>
            <p><strong>${invoice.company_name}</strong></p>
            <p>${invoice.company_address.replace(/\n/g, '<br>')}</p>
            <p><strong>Phone:</strong> ${invoice.company_phone}</p>
            <p><strong>Email:</strong> ${invoice.company_email}</p>
        </div>
        
        <p>If you have any questions about this invoice or our services, please don't hesitate to contact us.</p>
        
        <p>Thank you for your business!</p>
        
        <p>Best regards,<br>
        <strong>${invoice.company_name} Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This email was sent from ${invoice.company_name}. Please do not reply to this email.</p>
    </div>
</body>
</html>
  `.trim();
} 