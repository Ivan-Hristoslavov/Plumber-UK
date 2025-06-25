import { NextRequest, NextResponse } from "next/server";

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
    const body = await request.json();

    // Generate invoice number if not provided
    if (!body.invoice_number) {
      const { data: invoiceNumber, error: numberError } = await supabase.rpc(
        "generate_invoice_number",
      );

      if (numberError) {
        return NextResponse.json(
          { error: numberError.message },
          { status: 400 },
        );
      }

      body.invoice_number = invoiceNumber;
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert([body])
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
