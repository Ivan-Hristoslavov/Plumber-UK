import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { supabase } from "@/lib/supabase";
import { createPaymentLink, isStripeAvailable } from "@/lib/stripe";
import { sendEmail, EmailAttachment } from "@/lib/sendgrid-smtp";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

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
        console.log("Created payment link:", paymentLink);
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
        
        // Check if path exists and is accessible
        const fs = require('fs');
        if (!fs.existsSync(attachment.path)) {
          console.error(`File does not exist: ${attachment.path}`);
          continue;
        }

        const fileContent = await readFile(attachment.path);
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
  const margin = 40;
  let y = 60;

  // UK Invoice Header - Company Branding
  doc.setFillColor(59, 130, 246); // Blue header
  doc.rect(0, 0, pageWidth, 100, "F");
  
  // Company Logo/Name
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.company_name || "FixMyLeak Ltd", margin, 50);
  
  // UK Address format
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.company_address || "London, UK", margin, 75);

  // Invoice Title & Details - Right aligned
  y = 120;
  doc.setFontSize(28);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 180, y);
  
  // Invoice metadata
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  y += 30;
  doc.text(`Invoice No: ${invoice.invoice_number}`, pageWidth - 180, y);
  y += 20;
  doc.text(`Date: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, pageWidth - 180, y);
  y += 20;
  if (invoice.due_date) {
    doc.text(`Due Date: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, pageWidth - 180, y);
  }

  // Company Details Section (UK Format)
  y = 180;
  doc.setFontSize(14);
  doc.setTextColor(34, 34, 34);
  doc.setFont("helvetica", "bold");
  doc.text("From:", margin, y);
  
  y += 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(invoice.company_name || "FixMyLeak Ltd", margin, y);
  
  y += 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  // Multi-line address handling with better spacing
  const addressLines = (invoice.company_address || "London, UK").split('\n');
  addressLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 16;
  });
  
  // UK Business details with better spacing
  y += 5;
  doc.text(`Tel: ${invoice.company_phone || "+44 7700 123456"}`, margin, y);
  y += 16;
  doc.text(`Email: ${invoice.company_email || "admin@fixmyleak.com"}`, margin, y);
  y += 16;
  
  // VAT Number (UK requirement)
  if (invoice.company_vat_number) {
    doc.text(`VAT Reg No: ${invoice.company_vat_number}`, margin, y);
    y += 16;
  }

  // Customer Details Section (Bill To) - Reset y position for right column
  let customerY = 180;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", pageWidth - 280, customerY);
  
  customerY += 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(invoice.customer?.name || "Customer", pageWidth - 280, customerY);
  
  customerY += 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  if (invoice.customer?.email) {
    doc.text(invoice.customer.email, pageWidth - 280, customerY);
    customerY += 16;
  }
  
  if (invoice.customer?.address) {
    const customerAddressLines = invoice.customer.address.split('\n');
    customerAddressLines.forEach((line: string) => {
      doc.text(line, pageWidth - 280, customerY);
      customerY += 16;
    });
  }

  // Service Details Table (UK Style) - Move down to avoid overlap
  y = 380;
  
  // Table header
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - (margin * 2), 30, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 30);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Description", margin + 10, y + 20);
  doc.text("Date", pageWidth - 280, y + 20);
  doc.text("Amount", pageWidth - 80, y + 20, { align: "right" });
  
  // Service row
  y += 30;
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 40);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);
  doc.text(invoice.booking?.service || invoice.manual_description || "Plumbing Service", margin + 10, y + 15);
  if (invoice.booking?.date) {
    doc.text(format(new Date(invoice.booking.date), "dd/MM/yyyy"), pageWidth - 280, y + 15);
  }
  
  // Service location
  if (invoice.customer?.address) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Location: ${invoice.customer.address.split('\n')[0]}`, margin + 10, y + 30);
  }
  
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 80, y + 15, { align: "right" });

  // UK VAT Calculation Section
  y += 80;
  doc.setDrawColor(226, 232, 240);
  doc.line(pageWidth - 280, y, pageWidth - margin, y);
  
  y += 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Subtotal (excl. VAT)", pageWidth - 220, y);
  doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 80, y, { align: "right" });
  
  y += 22;
  doc.text(`VAT @ ${invoice.vat_rate}%`, pageWidth - 220, y);
  doc.text(`£${invoice.vat_amount.toFixed(2)}`, pageWidth - 80, y, { align: "right" });
  
  // Total
  y += 30;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.line(pageWidth - 280, y - 8, pageWidth - margin, y - 8);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text("TOTAL", pageWidth - 220, y);
  doc.text(`£${invoice.total_amount.toFixed(2)}`, pageWidth - 80, y, { align: "right" });

  // Payment Terms (UK Standard)
  y += 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85);
  doc.text("Payment Terms", margin, y);
  
  y += 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  
  const paymentTerms = [
    `Payment due within 30 days of invoice date`,
    `Late payment charges may apply after due date`,
    `Bank transfer preferred - details available on request`,
    `Cheques payable to: ${invoice.company_name || "FixMyLeak Ltd"}`
  ];
  
  paymentTerms.forEach((term: string) => {
    doc.text(`• ${term}`, margin, y);
    y += 18;
  });

  // Notes section
  if (invoice.notes) {
    y += 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Notes", margin, y);
    
    y += 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const noteLines = invoice.notes.split('\n');
    noteLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 18;
    });
  }

  // Footer (UK Legal Requirements)
  const footerY = pageHeight - 100;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  
  let footerText = `${invoice.company_name || "FixMyLeak Ltd"} • ${invoice.company_address || "London, UK"}`;
  if (invoice.company_vat_number) {
    footerText += ` • VAT Reg: ${invoice.company_vat_number}`;
  }
  
  doc.text(footerText, pageWidth / 2, footerY + 20, { align: "center" });
  doc.text("Thank you for choosing our services", pageWidth / 2, footerY + 35, { align: "center" });

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
  `You can pay this invoice online using the secure payment link below:\n${paymentLink}\n\nThis link accepts payments in ${currency.toUpperCase()} and is valid for 24 hours.\n\n` : 
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
              `<p>You can pay this invoice online using the secure payment link below:</p>
               <a href="${paymentLink}" class="payment-link">Pay Invoice Online (${currency.toUpperCase()})</a>
               <p><small>This link accepts payments in ${currency.toUpperCase()} and is valid for 24 hours.</small></p>` : 
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