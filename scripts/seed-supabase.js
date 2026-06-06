// scripts/seed-supabase.js
// Seed example data into Supabase tables. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(url, key);
const idsFile = path.resolve(__dirname, 'seed-ids.json');

function saveIds(obj) {
  fs.writeFileSync(idsFile, JSON.stringify(obj, null, 2));
}

function loadIds() {
  if (fs.existsSync(idsFile)) {
    return JSON.parse(fs.readFileSync(idsFile, 'utf8'));
  }
  return {};
}

async function upsert(table, rows, onConflict = 'id') {
  if (!rows || rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw error;
}

async function main() {
  try {
    const now = new Date().toISOString();
    const existing = loadIds();
    const recorded = {};

    // Create 4 organizations
    const orgs = [];
    for (let i = 1; i <= 4; i++) {
      const id = existing.organizations && existing.organizations[i - 1] ? existing.organizations[i - 1] : uuidv4();
      orgs.push({ id, name: `Org ${i}`, slug: `org-${i}`, plan: i % 2 === 0 ? 'pro' : 'starter', created_at: now });
      recorded.organizations = recorded.organizations || [];
      recorded.organizations.push(id);
    }
    await upsert('organizations', orgs);

    // Create 5 users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const id = existing.users && existing.users[i - 1] ? existing.users[i - 1] : uuidv4();
      const orgIndex = (i - 1) % orgs.length;
      users.push({ id, email: `user${i}@org${orgIndex + 1}.example`, full_name: `User ${i}`, role: i === 1 ? 'admin' : i === 2 ? 'manager' : 'officer', org_id: orgs[orgIndex].id, created_at: now });
      recorded.users = recorded.users || [];
      recorded.users.push(id);
    }
    await upsert('users', users);

    // Vendors (5)
    const vendors = [];
    for (let i = 1; i <= 5; i++) {
      const id = existing.vendors && existing.vendors[i - 1] ? existing.vendors[i - 1] : uuidv4();
      vendors.push({ id, org_id: orgs[0].id, name: `Vendor ${i}`, email: `vendor${i}@vendors.example`, trust_score: 50 + i, is_approved: i % 2 === 1, total_orders: i * 3, created_at: now });
      recorded.vendors = recorded.vendors || [];
      recorded.vendors.push(id);
    }
    await upsert('vendors', vendors);

    // Vendor analytics
    const analytics = vendors.map((v, idx) => ({ id: existing.vendor_analytics && existing.vendor_analytics[idx] ? existing.vendor_analytics[idx] : uuidv4(), vendor_id: v.id, total_rfqs: 3 + idx, total_quotes: 2 + idx, quote_win_rate: 10 * (idx + 1), trust_score: v.trust_score, last_computed_at: now }));
    recorded.vendor_analytics = analytics.map(a => a.id);
    await upsert('vendor_analytics', analytics, 'vendor_id');

    // RFQs (4)
    const rfqs = [];
    for (let i = 1; i <= 4; i++) {
      const id = existing.rfqs && existing.rfqs[i - 1] ? existing.rfqs[i - 1] : uuidv4();
      rfqs.push({ id, org_id: orgs[0].id, rfq_number: `RFQ-2026-00${i}`, title: `RFQ Title ${i}`, category: 'general', items: JSON.stringify([{ name: `Item ${i}`, qty: i * 2 }]), submission_deadline: now, status: 'active', created_at: now });
      recorded.rfqs = recorded.rfqs || [];
      recorded.rfqs.push(id);
    }
    await upsert('rfqs', rfqs);

    // RFQ vendors
    const rfqVendors = [];
    for (let i = 0; i < Math.min(5, vendors.length); i++) {
      const id = existing.rfq_vendors && existing.rfq_vendors[i] ? existing.rfq_vendors[i] : uuidv4();
      rfqVendors.push({ id, rfq_id: rfqs[0].id, vendor_id: vendors[i].id, invited_at: now, email_sent: true, status: 'invited' });
      recorded.rfq_vendors = recorded.rfq_vendors || [];
      recorded.rfq_vendors.push(id);
    }
    await upsert('rfq_vendors', rfqVendors);

    // Quotations
    const quotations = [];
    for (let i = 1; i <= 5; i++) {
      const id = existing.quotations && existing.quotations[i - 1] ? existing.quotations[i - 1] : uuidv4();
      quotations.push({ id, rfq_id: rfqs[0].id, vendor_id: vendors[i - 1].id, quote_number: `Q-00${i}`, line_items: JSON.stringify([{ item_id: '1', unit_price: 100 * i, qty: i }]), total_amount: 100 * i * i, currency: 'USD', status: 'submitted', submitted_at: now });
      recorded.quotations = recorded.quotations || [];
      recorded.quotations.push(id);
    }
    await upsert('quotations', quotations);

    // Approvals
    const approvals = [];
    for (let i = 1; i <= 4; i++) {
      const id = existing.approvals && existing.approvals[i - 1] ? existing.approvals[i - 1] : uuidv4();
      approvals.push({ id, org_id: orgs[0].id, entity_type: 'quotation', entity_id: quotations[i - 1].id, step: 1, approver_id: users[0].id, status: 'pending', created_at: now });
      recorded.approvals = recorded.approvals || [];
      recorded.approvals.push(id);
    }
    await upsert('approvals', approvals);

    // Purchase Orders
    const pos = [];
    for (let i = 1; i <= 3; i++) {
      const id = existing.purchase_orders && existing.purchase_orders[i - 1] ? existing.purchase_orders[i - 1] : uuidv4();
      pos.push({ id, org_id: orgs[0].id, po_number: `PO-2026-00${i}`, rfq_id: rfqs[0].id, quotation_id: quotations[0].id, vendor_id: vendors[0].id, line_items: JSON.stringify([{ item_id: '1', qty: i, unit_price: 100 }]), subtotal: 100 * i, tax_rate: 0, tax_amount: 0, total_amount: 100 * i, currency: 'USD', status: 'issued', issued_at: now, created_at: now });
      recorded.purchase_orders = recorded.purchase_orders || [];
      recorded.purchase_orders.push(id);
    }
    await upsert('purchase_orders', pos);

    // Invoices
    const invoices = [];
    for (let i = 1; i <= 3; i++) {
      const id = existing.invoices && existing.invoices[i - 1] ? existing.invoices[i - 1] : uuidv4();
      invoices.push({ id, org_id: orgs[0].id, invoice_number: `INV-2026-00${i}`, po_id: pos[i - 1].id, vendor_id: vendors[0].id, line_items: JSON.stringify([{ item_id: '1', qty: i, unit_price: 100 }]), subtotal: 100 * i, tax_amount: 0, total_amount: 100 * i, currency: 'USD', issue_date: now, due_date: now, payment_status: 'unpaid', created_at: now });
      recorded.invoices = recorded.invoices || [];
      recorded.invoices.push(id);
    }
    await upsert('invoices', invoices);

    // Notifications
    const notifications = [];
    for (let i = 1; i <= 4; i++) {
      const id = existing.notifications && existing.notifications[i - 1] ? existing.notifications[i - 1] : uuidv4();
      notifications.push({ id, user_id: users[i - 1].id, type: 'system.alert', title: `Notice ${i}`, message: `This is a seeded notification ${i}`, created_at: now });
      recorded.notifications = recorded.notifications || [];
      recorded.notifications.push(id);
    }
    await upsert('notifications', notifications);

    // Activities
    const activities = [];
    for (let i = 1; i <= 4; i++) {
      const id = existing.activities && existing.activities[i - 1] ? existing.activities[i - 1] : uuidv4();
      activities.push({ id, org_id: orgs[0].id, user_id: users[0].id, entity_type: 'rfq', entity_id: rfqs[0].id, action: `action_${i}`, metadata: {}, created_at: now });
      recorded.activities = recorded.activities || [];
      recorded.activities.push(id);
    }
    await upsert('activities', activities);

    // Write recorded IDs for cleanup and future runs
    saveIds(recorded);

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

main();
