// scripts/cleanup-seed.js
// Remove seeded rows recorded in scripts/seed-ids.json. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(url, key);
const idsFile = path.resolve(__dirname, 'seed-ids.json');

if (!fs.existsSync(idsFile)) {
  console.error('seed-ids.json not found. Nothing to cleanup.');
  process.exit(1);
}

const ids = JSON.parse(fs.readFileSync(idsFile, 'utf8'));

async function del(table, idsList) {
  if (!idsList || idsList.length === 0) return;
  const { error } = await supabase.from(table).delete().in('id', idsList);
  if (error) console.error(`Error deleting from ${table}:`, error.message);
}

async function main() {
  try {
    await del('activities', ids.activities);
    await del('notifications', ids.notifications);
    await del('invoices', ids.invoices);
    await del('purchase_orders', ids.purchase_orders);
    await del('approvals', ids.approvals);
    await del('quotations', ids.quotations);
    await del('rfq_vendors', ids.rfq_vendors);
    await del('rfqs', ids.rfqs);
    await del('vendor_analytics', ids.vendor_analytics);
    await del('vendors', ids.vendors);
    await del('users', ids.users);
    await del('organizations', ids.organizations);

    // remove local file
    fs.unlinkSync(idsFile);
    console.log('Cleanup complete');
  } catch (err) {
    console.error('Cleanup error', err);
    process.exit(1);
  }
}

main();
