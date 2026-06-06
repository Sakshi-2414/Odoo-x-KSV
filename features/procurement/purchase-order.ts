import createSupabaseServer from '../../lib/supabase/server';
import { sendPOIssued } from '../notifications/email';

export async function generatePurchaseOrder(quotationId: string, orgId: string) {
  const supabase = createSupabaseServer();

  // 1. Fetch the quotation and its associated RFQ/Vendor
  const { data: quotation, error: quoteError } = await supabase
    .from('quotations')
    .select('*, vendors(email)')
    .eq('id', quotationId)
    .single();

  if (quoteError || !quotation) {
    throw new Error(`Failed to fetch quotation: ${quoteError?.message}`);
  }

  // 2. Generate a PO Number
  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // 3. Create the PO Draft
  const poPayload = {
    org_id: orgId,
    po_number: poNumber,
    rfq_id: quotation.rfq_id,
    quotation_id: quotation.id,
    vendor_id: quotation.vendor_id,
    line_items: quotation.line_items,
    subtotal: quotation.total_amount, // Assuming simple mapping
    tax_rate: 0,
    tax_amount: 0,
    total_amount: quotation.total_amount,
    currency: quotation.currency,
    status: 'draft',
  };

  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert([poPayload])
    .select()
    .single();

  if (poError) {
    throw new Error(`Failed to generate PO: ${poError.message}`);
  }

  return po;
}

export async function issuePurchaseOrder(poId: string) {
  const supabase = createSupabaseServer();

  // 1. Mark PO as issued
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .update({ 
      status: 'issued', 
      issued_at: new Date().toISOString() 
    })
    .eq('id', poId)
    .select('*, vendors(email)')
    .single();

  if (poError || !po) {
    throw new Error(`Failed to issue PO: ${poError?.message}`);
  }

  // 2. Send Email Notification
  if (po.vendors?.email) {
    await sendPOIssued(po.vendors.email, po.po_number);
  }

  // 3. Update Vendor Analytics (increment total_orders)
  // This is a simplified approach. Usually we'd do a secure RPC call to increment.
  // We'll fetch, add 1, and update.
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('total_orders')
    .eq('id', po.vendor_id)
    .single();
    
  if (!vendorError && vendor) {
    await supabase
      .from('vendors')
      .update({ total_orders: (vendor.total_orders || 0) + 1 })
      .eq('id', po.vendor_id);
  }

  return po;
}
