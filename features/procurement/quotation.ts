import createSupabaseServer from '../../lib/supabase/server';
import { generatePurchaseOrder } from './purchase-order';

export async function awardQuotation(quotationId: string) {
  const supabase = createSupabaseServer();

  // 1. Fetch the winning quotation to get its RFQ ID
  const { data: winningQuote, error: fetchError } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', quotationId)
    .single();

  if (fetchError || !winningQuote) {
    throw new Error(`Failed to fetch quotation: ${fetchError?.message}`);
  }

  const rfqId = winningQuote.rfq_id;

  // 2. Award this quotation
  const { error: updateWinnerError } = await supabase
    .from('quotations')
    .update({ status: 'awarded' })
    .eq('id', quotationId);

  if (updateWinnerError) {
    throw new Error(`Failed to award quotation: ${updateWinnerError.message}`);
  }

  // 3. Reject all other quotations for the same RFQ
  const { error: updateLosersError } = await supabase
    .from('quotations')
    .update({ status: 'rejected' })
    .eq('rfq_id', rfqId)
    .neq('id', quotationId);

  if (updateLosersError) {
    console.error(`Warning: Failed to reject other quotations: ${updateLosersError.message}`);
    // Non-fatal, continue.
  }

  // 4. Update the RFQ status to 'awarded'
  const { error: rfqError } = await supabase
    .from('rfqs')
    .update({ status: 'awarded' })
    .eq('id', rfqId);

  if (rfqError) {
    console.error(`Warning: Failed to update RFQ status: ${rfqError.message}`);
  }

  // 5. Auto-generate the Draft PO
  let generatedPo = null;
  try {
    generatedPo = await generatePurchaseOrder(quotationId, winningQuote.org_id);
  } catch (err: any) {
    console.error(`Failed to generate PO automatically: ${err?.message}`);
    // We don't fail the awarding process if PO generation fails, but we should log it.
  }

  return {
    awarded_quotation_id: quotationId,
    rfq_id: rfqId,
    generated_po: generatedPo,
  };
}
