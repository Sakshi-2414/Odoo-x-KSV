import fs from 'fs';

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf-8');

  // Remove `export const Route = createFileRoute(...)` block entirely
  content = content.replace(/export const Route = createFileRoute\([\s\S]*?\}\);\n?/g, '');

  // For useNavigate
  if (content.includes('useNavigate')) {
    if (!content.includes('useRouter')) {
      content = `import { useRouter } from "next/navigation";\n` + content;
    }
    content = content.replace(/const navigate = useNavigate\([^)]*\);?/g, 'const router = useRouter();');
    content = content.replace(/navigate\(\{[\s\S]*?to:\s*(`[^`]*`|'[^']*'|"[^"]*")[\s\S]*?\}\)/g, 'router.push($1)');
    content = content.replace(/navigate\(\{[\s\S]*?to:\s*([^,}]+)[\s\S]*?\}\)/g, 'router.push($1)');
  }

  // Remove duplicate function if it exists (my previous script might have appended it but left the old one)
  // Actually, wait, the old one was `export default function VendorDetail() {` and the new one was `export default function VendorDetail({ params }: ...`
  // Let's just manually delete the old one.
  const oldFuncRegex = /export default function [A-Za-z0-9_]+\(\) \{[\s\S]*?const \{ [a-zA-Z0-9_,: ]+ \} = Route\.useLoaderData\(\);/g;
  content = content.replace(oldFuncRegex, '');

  // Fix Link import in vendors/page.tsx
  if (file.includes('vendors/page.tsx') && !content.includes('import Link from "next/link"')) {
    content = `import Link from "next/link";\n` + content;
  }

  // Remove duplicate Next.js links or useRouter imports if any
  const lines = content.split('\n');
  const uniqueLines = [];
  const importsSeen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('import Link from "next/link";')) {
      if (!importsSeen.has('next/link')) {
        importsSeen.add('next/link');
        uniqueLines.push(line);
      }
    } else if (line.startsWith('import { useRouter } from "next/navigation";') || line.startsWith('import { notFound } from "next/navigation";')) {
      // It's okay to have both, we can group them later or just keep them
      uniqueLines.push(line);
    } else {
      uniqueLines.push(line);
    }
  }

  fs.writeFileSync(file, uniqueLines.join('\n'));
  console.log(`Cleaned up ${file}`);
}

[
  'app/(auth)/login/page.tsx',
  'app/(dashboard)/rfqs/[id]/page.tsx',
  'app/(dashboard)/rfqs/create/page.tsx',
  'app/(dashboard)/vendors/[id]/page.tsx',
  'app/(dashboard)/vendors/page.tsx'
].forEach(fixFile);
