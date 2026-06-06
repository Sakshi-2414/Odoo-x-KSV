import fs from 'fs';
import path from 'path';

const filesToFix = [
  'app/(dashboard)/vendors/[id]/page.tsx',
  'app/(dashboard)/rfqs/[id]/page.tsx',
  'app/(dashboard)/purchase-orders/[id]/page.tsx',
  'app/(dashboard)/invoices/[id]/page.tsx',
  'app/(dashboard)/rfqs/[id]/quotations/page.tsx',
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf-8');

  // Remove `export const Route = createFileRoute(...)({ ... });`
  content = content.replace(/export const Route = createFileRoute\([^)]*\)\(\{[\s\S]*?component: [^,]*,?\n?.*\}\);/m, '');

  // For each specific component, rewrite the signature and loader
  if (file.includes('vendors/[id]')) {
    content = content.replace(/export default function VendorDetail\(\) \{[\s\S]*?const \{ vendor: v \} = Route\.useLoaderData\(\);/m, 
`import { notFound } from "next/navigation";
import React from "react";

export default function VendorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const vendor = VENDORS.find((v) => v.id === id);
  if (!vendor) notFound();
  const v = vendor;`);
  } else if (file.includes('rfqs/[id]/quotations')) {
    content = content.replace(/export default function CompareQuotes\(\) \{[\s\S]*?const \{ rfq, quotes \} = Route\.useLoaderData\(\);/m,
`import { notFound } from "next/navigation";
import React from "react";

export default function CompareQuotes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const rfq = RFQS.find((r) => r.id === id);
  if (!rfq) notFound();
  const quotes = QUOTATIONS.filter((q) => q.rfq_id === id);`);
  } else if (file.includes('rfqs/[id]')) {
    content = content.replace(/export default function RFQDetail\(\) \{[\s\S]*?const \{ rfq, quotes \} = Route\.useLoaderData\(\);/m,
`import { notFound } from "next/navigation";
import React from "react";

export default function RFQDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const rfq = RFQS.find((r) => r.id === id);
  if (!rfq) notFound();
  const quotes = QUOTATIONS.filter((q) => q.rfq_id === id);`);
  } else if (file.includes('purchase-orders/[id]')) {
    content = content.replace(/export default function PODetail\(\) \{[\s\S]*?const \{ po \} = Route\.useLoaderData\(\);/m,
`import { notFound } from "next/navigation";
import React from "react";

export default function PODetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const po = POS.find((p) => p.id === id);
  if (!po) notFound();`);
  } else if (file.includes('invoices/[id]')) {
    content = content.replace(/export default function InvoiceDetail\(\) \{[\s\S]*?const \{ inv \} = Route\.useLoaderData\(\);/m,
`import { notFound } from "next/navigation";
import React from "react";

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const inv = INVOICES.find((i) => i.id === id);
  if (!inv) notFound();`);
  }

  // Next.js Link parameters fix:
  // Convert `<Link href="/rfqs/$id/quotations" params={{ id: rfq.id }}>`
  // To `<Link href={\`/rfqs/\${rfq.id}/quotations\`}>`
  content = content.replace(/<Link\s+href="([^"]+)"\s+params=\{\{\s*([a-zA-Z0-9_]+):\s*([^ }]+)\s*\}\}/g, (match, href, pName, pVal) => {
    const newHref = href.replace(`$${pName}`, `\${${pVal}}`);
    return `<Link href={\`${newHref}\`}`;
  });

  fs.writeFileSync(file, content);
  console.log(`Fixed loaders in ${file}`);
}
