import fs from 'fs';

const files = [
  'app/(dashboard)/invoices/page.tsx',
  'app/(dashboard)/purchase-orders/page.tsx',
  'app/(dashboard)/quotations/page.tsx',
  'app/(dashboard)/rfqs/page.tsx',
  'app/(dashboard)/vendors/page.tsx',
  'app/(dashboard)/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Pattern to replace `<Link href="/vendors/$id" params={{ id: v.id }}>`
  // with `<Link href={\`/vendors/\${v.id}\`}>`
  // We can just find `<Link href="..." params={{ id: xyz }}>`
  content = content.replace(/<Link\s+([^>]*)href="([^"]+)"\s+params=\{\{\s*([a-zA-Z0-9_]+):\s*([^ }]+)\s*\}\}([^>]*)>/g, (match, prefix, href, pName, pVal, suffix) => {
    const newHref = href.replace(`$${pName}`, `\${${pVal}}`);
    return `<Link ${prefix}href={\`${newHref}\`}${suffix}>`;
  });

  // What if params come before href?
  content = content.replace(/<Link\s+([^>]*)params=\{\{\s*([a-zA-Z0-9_]+):\s*([^ }]+)\s*\}\}\s+href="([^"]+)"([^>]*)>/g, (match, prefix, pName, pVal, href, suffix) => {
    const newHref = href.replace(`$${pName}`, `\${${pVal}}`);
    return `<Link ${prefix}href={\`${newHref}\`}${suffix}>`;
  });

  fs.writeFileSync(file, content);
  console.log(`Fixed params in ${file}`);
}
