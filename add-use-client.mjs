import fs from 'fs';

const files = [
  'app/(auth)/login/page.tsx',
  'app/(dashboard)/approvals/page.tsx',
  'app/(dashboard)/reports/page.tsx',
  'app/(dashboard)/rfqs/create/page.tsx',
  'app/(dashboard)/settings/page.tsx',
  'app/(dashboard)/vendors/page.tsx',
  'app/vendor-portal/rfq/[token]/page.tsx'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('"use client"')) {
      content = '"use client";\n\n' + content;
      fs.writeFileSync(file, content);
      console.log(`Added 'use client' to ${file}`);
    }
  } catch (err) {
    console.error(`Error reading ${file}`, err.message);
  }
}
