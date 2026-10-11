import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { sendEmail } from "../../../../lib/sendgrid";
import { buildPaymentLinkEmail } from "@/lib/email-builders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, customer_email, customer_name, payment_link_url, amount } = body;

    if (!payment_id || !customer_email || !customer_name || !payment_link_url || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get admin profile for email sender info
    const { data: adminProfile } = await supabase
      .from("admin_profile")
      .select("name, email, company_name")
      .single();

    if (!adminProfile) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 500 }
      );
    }

    // Create email content
    const company = adminProfile.company_name || adminProfile.name;
    const {
      subject: emailSubject,
      html: emailContent,
      text: emailText,
    } = buildPaymentLinkEmail({
      company,
      adminName: adminProfile.name,
      adminEmail: adminProfile.email,
      hasCompanyName: !!adminProfile.company_name,
      customerName: customer_name,
      amount,
      paymentLinkUrl: payment_link_url,
    });

    // Send email using SendGrid
    try {
      console.log('Attempting to send email to:', customer_email);
      console.log('Email subject:', emailSubject);
      console.log('Admin profile email:', adminProfile.email);
      
      await sendEmail({
        to: customer_email,
        subject: emailSubject,
        text: emailText,
        html: emailContent,
      });
      
      console.log('✅ Payment link email sent successfully to:', customer_email);
    } catch (emailError: any) {
      console.error('❌ Error sending payment link email:', emailError);
      console.error('Error details:', emailError.response?.body || emailError.message);
      return NextResponse.json(
        { error: `Failed to send payment link email: ${emailError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Update payment record to track that email was sent
    // First get the current payment to get existing notes
    const { data: currentPayment } = await supabase
      .from("payments")
      .select("notes")
      .eq("id", payment_id)
      .single();
    
    const currentNotes = currentPayment?.notes || '';
    const newNotes = `${currentNotes} | Email sent to ${customer_email} at ${new Date().toISOString()}`.trim();
    
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        notes: newNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment_id);

    if (updateError) {
      console.error("Error updating payment record:", updateError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment link email sent successfully" 
    });

  } catch (error) {
    console.error("Error sending payment link email:", error);
    return NextResponse.json(
      { error: "Failed to send payment link email" },
      { status: 500 }
    );
  }
} 