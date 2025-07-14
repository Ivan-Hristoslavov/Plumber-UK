import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

import { supabase } from "../../../lib/supabase";

// GET - Fetch all invoices with customer and booking details
export async function GET() {
  try {
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, email, address),
        booking:bookings(service, date, time)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const invoiceData = {
      customer_id: formData.get('customer_id') as string,
      booking_id: formData.get('booking_id') as string || null,
      invoice_date: formData.get('invoice_date') as string,
      due_date: formData.get('due_date') as string,
      subtotal: parseFloat(formData.get('subtotal') as string),
      vat_rate: parseFloat(formData.get('vat_rate') as string),
      vat_amount: parseFloat(formData.get('vat_amount') as string),
      total_amount: parseFloat(formData.get('total_amount') as string),
      status: formData.get('status') as string,
      company_name: formData.get('company_name') as string,
      company_address: formData.get('company_address') as string,
      company_phone: formData.get('company_phone') as string,
      company_email: formData.get('company_email') as string,
      company_vat_number: formData.get('company_vat_number') as string,
      notes: formData.get('notes') as string || null,
    };

    // Handle image files
    const images = formData.getAll('images') as File[];
    const imageAttachments: { filename: string; path: string }[] = [];

    if (images.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'invoices');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory already exists or couldn't be created
      }

      // Process each image
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate unique filename
          const timestamp = Date.now();
          const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${timestamp}_${i}_${originalName}`;
          const filePath = join(uploadsDir, filename);
          
          // Save file
          await writeFile(filePath, buffer);
          
          imageAttachments.push({
            filename: originalName,
            path: filePath
          });
        }
      }
    }

    // Generate invoice number (always generate for new invoices)
    const { data: invoiceNumber, error: numberError } = await supabase.rpc(
      "generate_invoice_number",
    );

    if (numberError) {
      return NextResponse.json(
        { error: numberError.message },
        { status: 400 },
      );
    }

    // Create final invoice object with generated invoice number and attachments
    const finalInvoiceData = {
      ...invoiceData,
      invoice_number: invoiceNumber,
      ...(imageAttachments.length > 0 && { 
        image_attachments: JSON.stringify(imageAttachments) 
      })
    };

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert([finalInvoiceData])
      .select(
        `
        *,
        customer:customers(name, email, address),
        booking:bookings(service, date, time)
      `,
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
