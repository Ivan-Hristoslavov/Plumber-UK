import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "../../../lib/supabase";

const supabaseStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch invoices with pagination and customer/booking details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    // Get paginated invoices
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, email, address),
        booking:bookings(service, date, time)
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
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
    
    // Get VAT settings from database
    const { data: vatSettings, error: vatError } = await supabase
      .from("vat_settings")
      .select("*")
      .single();

    if (vatError && vatError.code !== 'PGRST116') {
      console.error("Error fetching VAT settings:", vatError);
      return NextResponse.json({ error: "Failed to fetch VAT settings" }, { status: 500 });
    }

    // Use VAT settings or defaults
    const defaultVATRate = vatSettings?.vat_rate || 20.00;
    const vatEnabled = vatSettings?.is_enabled || false;
    
    // Extract form fields
    const subtotal = parseFloat(formData.get('subtotal') as string);
    const vatRate = vatEnabled ? defaultVATRate : 0;
    const vatAmount = vatEnabled ? (subtotal * vatRate / 100) : 0;
    const totalAmount = subtotal + vatAmount;
    
    const invoiceData = {
      customer_id: formData.get('customer_id') as string,
      booking_id: formData.get('booking_id') as string || null,
      invoice_date: formData.get('invoice_date') as string,
      due_date: formData.get('due_date') as string,
      subtotal: subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      status: formData.get('status') as string,
      company_name: formData.get('company_name') as string,
      company_address: formData.get('company_address') as string,
      company_phone: formData.get('company_phone') as string,
      company_email: formData.get('company_email') as string,
      company_vat_number: vatSettings?.vat_number || formData.get('company_vat_number') as string,
      notes: formData.get('notes') as string || null,
      // Add manual entry fields
      manual_service: formData.get('manual_service') as string || null,
      manual_description: formData.get('manual_description') as string || null,
    };

    // Handle image files
    const images = formData.getAll('images') as File[];
    const imageAttachments: { filename: string; path: string }[] = [];

    if (images.length > 0) {
      // Process each image
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (file && file.size > 0) {
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Generate unique filename
            const timestamp = Date.now();
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `${timestamp}_${i}_${originalName}`;
            
            // Upload to Supabase Storage
            const { data, error } = await supabaseStorage.storage
              .from('invoices')
              .upload(filename, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              console.error(`Error uploading image ${i}:`, error);
              continue;
            }

            // Get public URL
            const { data: urlData } = supabaseStorage.storage
              .from('invoices')
              .getPublicUrl(filename);
            
            imageAttachments.push({
              filename: originalName,
              path: urlData.publicUrl
            });
          } catch (error) {
            console.error(`Error processing image ${i}:`, error);
          }
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
      console.error('Error creating invoice:', error);
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
