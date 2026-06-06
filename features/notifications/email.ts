import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'mock_key');
const isMock = !process.env.RESEND_API_KEY;

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  if (isMock) {
    console.log(`\n[MOCK EMAIL SENT]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html?.substring(0, 50) + '...'}\n`);
    return { id: 'mock-id-' + Date.now() };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'VendorBridge <noreply@vendorbridge.example>', // Change to your verified domain
      to,
      subject,
      text: text || '',
      html: html || '',
    });

    if (error) {
      console.error('Resend Error:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
    throw err;
  }
}

export async function sendRFQInvitation(vendorEmail: string, rfqNumber: string, title: string) {
  return sendEmail({
    to: vendorEmail,
    subject: `New Request for Quotation: ${rfqNumber}`,
    text: `You have been invited to submit a quote for ${rfqNumber} - ${title}. Please log in to your VendorBridge portal to view details and submit your quotation.`,
  });
}

export async function sendPOIssued(vendorEmail: string, poNumber: string) {
  return sendEmail({
    to: vendorEmail,
    subject: `Purchase Order Issued: ${poNumber}`,
    text: `Great news! A new Purchase Order (${poNumber}) has been issued to your company. Please log in to view the details and acknowledge receipt.`,
  });
}

export async function sendApprovalRequest(approverEmail: string, entityType: string, entityId: string) {
  return sendEmail({
    to: approverEmail,
    subject: `Action Required: New ${entityType} Approval`,
    text: `A new ${entityType} requires your review and approval. Please log in to the Procurement Command Center to process this request.`,
  });
}
