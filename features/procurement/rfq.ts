import createSupabaseServer from '../../lib/supabase/server';
import { sendRFQInvitation } from '../notifications/email';

export async function publishRFQ(rfqId: string) {
  const supabase = createSupabaseServer();

  // 1. Fetch the RFQ
  const { data: rfq, error: rfqError } = await supabase
    .from('rfqs')
    .select('*')
    .eq('id', rfqId)
    .single();

  if (rfqError || !rfq) {
    throw new Error(`Failed to fetch RFQ: ${rfqError?.message}`);
  }

  // 2. Change status to active
  const { error: updateError } = await supabase
    .from('rfqs')
    .update({ status: 'active' })
    .eq('id', rfqId);

  if (updateError) {
    throw new Error(`Failed to activate RFQ: ${updateError.message}`);
  }

  // 3. Find all invited vendors and send emails
  const { data: rfqVendors, error: rvError } = await supabase
    .from('rfq_vendors')
    .select('*, vendors(email)')
    .eq('rfq_id', rfqId);

  if (!rvError && rfqVendors && rfqVendors.length > 0) {
    for (const rv of rfqVendors) {
      if (rv.vendors?.email && !rv.email_sent) {
        try {
          await sendRFQInvitation(rv.vendors.email, rfq.rfq_number, rfq.title);
          // Mark as sent
          await supabase
            .from('rfq_vendors')
            .update({ email_sent: true, invited_at: new Date().toISOString() })
            .eq('id', rv.id);
        } catch (e) {
          console.error(`Failed to send invite to ${rv.vendors.email}`, e);
        }
      }
    }
  }

  return { success: true, rfq_id: rfqId, status: 'active' };
}
