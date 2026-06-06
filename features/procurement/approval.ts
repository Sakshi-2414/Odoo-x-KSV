import createSupabaseServer from '../../lib/supabase/server';
import { sendApprovalRequest } from '../notifications/email';
import { awardQuotation } from './quotation';
import { issuePurchaseOrder } from './purchase-order';

export async function createApprovalWorkflow({
  entityType,
  entityId,
  amount,
  orgId,
  requesterId
}: {
  entityType: 'quotation' | 'purchase_order';
  entityId: string;
  amount: number;
  orgId: string;
  requesterId?: string;
}) {
  const supabase = createSupabaseServer();

  // Determine tiers based on amount
  // Hackathon mock logic:
  // < $10k -> Step 1 (Manager)
  // >= $10k -> Step 1 (Manager), Step 2 (Director)
  
  const requiredSteps = amount >= 10000 ? 2 : 1;

  const approvals = [];
  for (let i = 1; i <= requiredSteps; i++) {
    approvals.push({
      org_id: orgId,
      entity_type: entityType,
      entity_id: entityId,
      step: i,
      // approver_id would normally be dynamically looked up based on org hierarchy
      // For now, we leave it null so any user with the right role can claim it
      status: i === 1 ? 'pending' : 'awaiting_previous_step', 
    });
  }

  const { data, error } = await supabase
    .from('approvals')
    .insert(approvals)
    .select();

  if (error) {
    throw new Error(`Failed to create approval workflow: ${error.message}`);
  }

  // Send email to managers for Step 1
  // Mock finding managers
  const { data: managers } = await supabase
    .from('users')
    .select('email')
    .eq('org_id', orgId)
    .eq('role', 'manager');

  if (managers && managers.length > 0) {
    await sendApprovalRequest(managers[0].email, entityType, entityId);
  }

  return data;
}

export async function processApprovalDecision(approvalId: string, decision: 'approved' | 'rejected', comments?: string, approverId?: string) {
  const supabase = createSupabaseServer();

  // 1. Update this approval step
  const { data: approval, error: updateError } = await supabase
    .from('approvals')
    .update({ 
      status: decision,
      comments,
      approver_id: approverId,
      approved_at: new Date().toISOString()
    })
    .eq('id', approvalId)
    .select()
    .single();

  if (updateError || !approval) {
    throw new Error(`Failed to process approval: ${updateError?.message}`);
  }

  if (decision === 'rejected') {
    // If rejected, reject all subsequent steps
    await supabase
      .from('approvals')
      .update({ status: 'rejected_by_previous' })
      .eq('entity_type', approval.entity_type)
      .eq('entity_id', approval.entity_id)
      .gt('step', approval.step);
    
    // We should also update the entity itself to 'rejected'
    if (approval.entity_type === 'quotation') {
      await supabase.from('quotations').update({ status: 'rejected' }).eq('id', approval.entity_id);
    } else if (approval.entity_type === 'purchase_order') {
      await supabase.from('purchase_orders').update({ status: 'rejected' }).eq('id', approval.entity_id);
    }

    return { success: true, final_status: 'rejected' };
  }

  // If approved, check if there's a next step
  const { data: nextStep } = await supabase
    .from('approvals')
    .select('*')
    .eq('entity_type', approval.entity_type)
    .eq('entity_id', approval.entity_id)
    .eq('step', approval.step + 1)
    .single();

  if (nextStep) {
    // Unlock next step
    await supabase
      .from('approvals')
      .update({ status: 'pending' })
      .eq('id', nextStep.id);
      
    // Send email to directors for Step 2
    const { data: directors } = await supabase
      .from('users')
      .select('email')
      .eq('org_id', approval.org_id)
      .eq('role', 'admin'); // Assuming admin acts as director for demo
    
    if (directors && directors.length > 0) {
      await sendApprovalRequest(directors[0].email, approval.entity_type, approval.entity_id);
    }

    return { success: true, final_status: 'pending_next_step' };
  }

  // If no next step, the workflow is FULLY APPROVED!
  // Trigger business logic based on entity type
  if (approval.entity_type === 'quotation') {
    await awardQuotation(approval.entity_id);
  } else if (approval.entity_type === 'purchase_order') {
    await issuePurchaseOrder(approval.entity_id);
  }

  return { success: true, final_status: 'fully_approved' };
}
