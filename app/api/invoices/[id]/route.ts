import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single invoice
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const { data: invoice, error } = await supabase
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    const formData = await request.formData();
    
    // Extract form fields
    const customer_id = formData.get('customer_id') as string;
    const booking_id = formData.get('booking_id') as string || null;
    const invoice_date = formData.get('invoice_date') as string;
    const due_date = formData.get('due_date') as string;
    const subtotal = parseFloat(formData.get('subtotal') as string);
    const vat_rate = parseFloat(formData.get('vat_rate') as string);
    const vat_amount = parseFloat(formData.get('vat_amount') as string);
    const total_amount = parseFloat(formData.get('total_amount') as string);
    const company_name = formData.get('company_name') as string;
    const company_address = formData.get('company_address') as string;
    const company_phone = formData.get('company_phone') as string;
    const company_email = formData.get('company_email') as string;
    const company_vat_number = formData.get('company_vat_number') as string;
    const notes = formData.get('notes') as string || null;

    // Handle image attachments
    const images = formData.getAll('images') as File[];
    let imageAttachments: { filename: string; path: string }[] = [];

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

    // Create update object
    const updateData: any = {
      customer_id,
      booking_id,
      invoice_date,
      due_date,
      subtotal,
      vat_rate,
      vat_amount,
      total_amount,
      company_name,
      company_address,
      company_phone,
      company_email,
      company_vat_number,
      notes,
      updated_at: new Date().toISOString()
    };

    // Manual entry fields will be added later when database schema is updated

    // Add image attachments if any
    if (imageAttachments.length > 0) {
      updateData.image_attachments = JSON.stringify(imageAttachments);
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        customer:customers(name, email, address),
        booking:bookings(service, date, time)
      `
      )
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error in invoice PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    // First check if invoice exists
    const { data: existingInvoice, error: fetchError } = await supabase
      .from("invoices")
      .select("id, image_attachments")
      .eq("id", id)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Delete associated image files if any
    if (existingInvoice.image_attachments) {
      try {
        const attachments = JSON.parse(existingInvoice.image_attachments);
        const fs = require('fs');
        
        attachments.forEach((attachment: { path: string }) => {
          try {
            if (fs.existsSync(attachment.path)) {
              fs.unlinkSync(attachment.path);
            }
          } catch (error) {
            console.error(`Error deleting file ${attachment.path}:`, error);
          }
        });
      } catch (error) {
        console.error("Error parsing/deleting image attachments:", error);
      }
    }

    // Delete the invoice
    const { error: deleteError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting invoice:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error in invoice DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 