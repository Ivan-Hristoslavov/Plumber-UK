import sgMail from '@sendgrid/mail';
import { createClient } from '@/lib/supabase/server';
import { getGmailMode, getGmailSender, isGmailConfigured, sendViaGmail } from '@/lib/gmail';

// Initialize SendGrid with API key
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

if (!sendgridApiKey) {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will be disabled.');
}

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
}

/**
 * Get the sender email address with conditional logic:
 * - Use business_email from admin_profile table as primary sender
 * - Fall back to ADMIN_EMAIL from environment if needed
 */
export async function getSenderEmail(): Promise<string> {
  // Gmail only sends as the account it logs in with.
  if (isGmailConfigured()) return getGmailSender()!;

  try {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .select('business_email, email')
      .single();

    if (error) {
      console.warn('Could not fetch admin profile business_email:', error);
      return adminEmail || 'noreply@fixmyleak.com';
    }

    // Use business_email if available, otherwise fall back to regular email or env
    return profile?.business_email || profile?.email || adminEmail || 'noreply@fixmyleak.com';
  } catch (error) {
    console.warn('Error getting sender email:', error);
    return adminEmail || 'noreply@fixmyleak.com';
  }
}

export interface AdminRecipient {
  email: string | null;
  source: 'BOOKING_NOTIFY_EMAIL' | 'admin_profile' | 'ADMIN_EMAIL' | 'none';
  /** Set when the admin_profile lookup failed (RLS, several rows, network). */
  profileError?: string;
}

/**
 * Where "new booking" notifications go: BOOKING_NOTIFY_EMAIL if set, then
 * admin_profile.email, then the ADMIN_EMAIL env var. Shared by the booking route and the admin test page so
 * the test exercises exactly what a real booking does.
 */
export async function getAdminRecipient(): Promise<AdminRecipient> {
  // admin_profile.email is the admin login and cannot be edited in the panel,
  // so alerts get their own setting that wins over it.
  const notifyEmail = process.env.BOOKING_NOTIFY_EMAIL?.trim();
  if (notifyEmail) {
    return { email: notifyEmail, source: 'BOOKING_NOTIFY_EMAIL' };
  }

  let profileError: string | undefined;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('admin_profile')
      .select('email')
      .single();

    if (error) {
      profileError = error.message;
    } else if (data?.email) {
      return { email: data.email, source: 'admin_profile' };
    }
  } catch (error) {
    profileError = error instanceof Error ? error.message : 'Unknown error';
  }

  if (adminEmail) {
    return { email: adminEmail, source: 'ADMIN_EMAIL', profileError };
  }

  return { email: null, source: 'none', profileError };
}

/** Env/config facts for the admin test page. Never returns secret values. */
export function getEmailEnvStatus() {
  const gmailMode = getGmailMode();

  return {
    provider: gmailMode
      ? (`gmail-${gmailMode}` as 'gmail-app-password' | 'gmail-oauth2')
      : sendgridApiKey
        ? ('sendgrid' as const)
        : ('none' as const),
    sendgridApiKey: !!sendgridApiKey,
    adminEmail: !!adminEmail,
  };
}

/** Pulls the useful part out of a SendGrid error (status + its own messages). */
export function describeSendGridError(error: unknown): {
  message: string;
  statusCode?: number;
  details: string[];
} {
  const response = (error as any)?.response;
  const details: string[] = Array.isArray(response?.body?.errors)
    ? response.body.errors.map((e: any) => e?.message).filter(Boolean)
    : [];

  // Gmail (nodemailer) failures carry a short code instead of an HTTP response.
  const code = (error as any)?.code;
  if (code === 'EAUTH') {
    details.push(
      'Google rejected the login. Check GMAIL_USER and the app password (2-Step Verification must be on), or regenerate the OAuth refresh token.',
    );
  } else if (code === 'ESOCKET' || code === 'ECONNECTION' || code === 'ETIMEDOUT') {
    details.push('Could not reach smtp.gmail.com:465. Check the network or firewall.');
  }

  return {
    message: error instanceof Error ? error.message : 'Unknown error',
    statusCode: response?.statusCode,
    details,
  };
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (isGmailConfigured()) {
    return sendViaGmail(options);
  }

  if (!sendgridApiKey) {
    console.error('SendGrid API key not configured');
    throw new Error('Email service not configured');
  }

  try {
    const fromEmail = await getSenderEmail();
    
    const msg: any = {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      text: options.text,
    };

    // Add HTML content if provided
    if (options.html) {
      msg.html = options.html;
    }

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content.toString('base64'),
        type: attachment.contentType,
        disposition: 'attachment'
      }));
    }

    console.log('Sending email via SendGrid:', {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      attachments: options.attachments?.length || 0
    });

    const response = await sgMail.send(msg);
    
    console.log('Email sent successfully:', {
      statusCode: response[0].statusCode,
      headers: response[0].headers
    });

    return true;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    
    if (error instanceof Error) {
      // Log specific SendGrid error details
      if ('response' in error && error.response) {
        const response = (error as any).response;
        console.error('SendGrid response error:', {
          statusCode: response.statusCode,
          body: response.body
        });
      }
    }
    
    throw error;
  }
}

/**
 * Test SendGrid configuration
 */
export async function testSendGridConnection(): Promise<boolean> {
  if (!sendgridApiKey) {
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    const fromEmail = await getSenderEmail();
    console.log('SendGrid configuration test:', {
      apiKeyConfigured: !!sendgridApiKey,
      senderEmail: fromEmail,
      adminEmailFromEnv: adminEmail
    });
    
    return true;
  } catch (error) {
    console.error('SendGrid configuration test failed:', error);
    return false;
  }
} 