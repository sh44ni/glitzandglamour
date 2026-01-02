import { Resend } from 'resend';

// Initialize Resend client
// TODO: Replace with database email logging when migrating from MVP
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}

/**
 * Send an email using Resend
 * This function is abstracted to make it easy to swap email providers later
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    try {
        // Check if API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY not configured. Email not sent.');
            return { success: true }; // Return success in dev mode
        }

        const { error } = await resend.emails.send({
            from: `Glitz & Glamour Studio <${fromEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Email service error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email',
        };
    }
}

/**
 * Generate booking confirmation email HTML
 */
export function generateBookingEmailHtml(booking: {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    notes?: string;
}): string {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New Booking Request</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #FF69B4 0%, #E5559A 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                    Glitz & Glamour Studio
                  </h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
                    New Booking Request
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">
                    Booking Details
                  </h2>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">Client Name</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">${booking.name}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">Email</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">
                          <a href="mailto:${booking.email}" style="color: #FF69B4; text-decoration: none;">${booking.email}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">Phone</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">
                          <a href="tel:${booking.phone.replace(/\D/g, '')}" style="color: #FF69B4; text-decoration: none;">${booking.phone}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">Service Requested</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">${booking.service}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">Preferred Date</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">${formatDate(booking.date)}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">Preferred Time</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">${formatTime(booking.time)}</p>
                      </td>
                    </tr>
                    ${booking.notes ? `
                    <tr>
                      <td style="padding: 12px 0;">
                        <strong style="color: #6b7280; font-size: 14px;">Special Requests</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">${booking.notes}</p>
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                    © ${new Date().getFullYear()} Glitz & Glamour Studio by Jolany Lavalle
                  </p>
                  <p style="color: #6b7280; margin: 10px 0 0; font-size: 12px;">
                    Oceanside, CA
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate contact form email HTML
 */
export function generateContactEmailHtml(contact: {
    name: string;
    email: string;
    message: string;
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New Contact Message</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #FF69B4 0%, #E5559A 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                    Glitz & Glamour Studio
                  </h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
                    New Contact Message
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">From</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">${contact.name}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <strong style="color: #6b7280; font-size: 14px;">Email</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px;">
                          <a href="mailto:${contact.email}" style="color: #FF69B4; text-decoration: none;">${contact.email}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <strong style="color: #6b7280; font-size: 14px;">Message</strong>
                        <p style="color: #1f2937; margin: 4px 0 0; font-size: 16px; line-height: 1.6;">${contact.message.replace(/\n/g, '<br>')}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="margin-top: 30px; padding: 20px; background-color: #fdf2f8; border-radius: 8px;">
                    <p style="color: #9d174d; margin: 0; font-size: 14px;">
                      <strong>Reply directly to this email</strong> to respond to the customer.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                    © ${new Date().getFullYear()} Glitz & Glamour Studio by Jolany Lavalle
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
