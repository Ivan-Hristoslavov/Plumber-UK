import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Send invoice email
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { includePaymentLink = false } = body;

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, email, address, phone),
        booking:bookings(service, date, time, description)
      `
      )
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
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

    // Create Stripe payment link if requested
    let paymentLink = null;
    if (includePaymentLink) {
      try {
        // Import Stripe here to avoid loading it unnecessarily
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        
        const paymentLinkData = await stripe.paymentLinks.create({
          line_items: [
            {
              price_data: {
                currency: "gbp",
                product_data: {
                  name: `Invoice ${invoice.invoice_number}`,
                  description: `Payment for ${invoice.booking?.service || 'Plumbing Service'}`,
                },
                unit_amount: Math.round(invoice.total_amount * 100), // Convert to pence
              },
              quantity: 1,
            },
          ],
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            customer_id: invoice.customer_id,
          },
        });
        
        paymentLink = paymentLinkData.url;
      } catch (stripeError) {
        console.error("Error creating Stripe payment link:", stripeError);
        return NextResponse.json(
          { error: "Failed to create payment link" },
          { status: 500 }
        );
      }
    }

    // Prepare email content
    const emailSubject = `Invoice ${invoice.invoice_number} from ${invoice.company_name}`;
    const emailBody = generateEmailBody(invoice, paymentLink);

    // Here you would integrate with your email service (SendGrid, Nodemailer, etc.)
    // For now, we'll simulate sending the email
    console.log("Sending email to:", invoice.customer.email);
    console.log("Subject:", emailSubject);
    console.log("Body:", emailBody);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update invoice status to 'sent' and set sent_date
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "sent",
        sent_date: new Date().toISOString().split('T')[0],
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update invoice status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Invoice email sent successfully",
      recipient: invoice.customer.email,
      paymentLink: paymentLink,
    });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateEmailBody(invoice: any, paymentLink: string | null): string {
  const customerName = invoice.customer?.name || "Valued Customer";
  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString("en-GB");
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-GB") : "Upon receipt";

  return `
Dear ${customerName},

Thank you for choosing ${invoice.company_name} for your plumbing needs.

Please find attached your invoice for the services provided:

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Invoice Date: ${invoiceDate}
- Due Date: ${dueDate}
- Service: ${invoice.booking?.service || 'Plumbing Service'}
- Total Amount: £${invoice.total_amount.toFixed(2)}

${invoice.notes ? `Additional Notes:\n${invoice.notes}\n\n` : ''}

Payment Information:
${paymentLink ? 
  `You can pay this invoice online using the secure payment link below:\n${paymentLink}\n\n` : 
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