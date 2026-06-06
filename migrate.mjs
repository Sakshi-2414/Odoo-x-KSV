import fs from 'fs';
import path from 'path';

const routesDir = '../front/src/routes';
const appDir = './app';

const mapping = [
  { src: 'login.tsx', dest: '(auth)/login/page.tsx' },
  { src: '_app.index.tsx', dest: '(dashboard)/page.tsx' },
  { src: '_app.approvals.tsx', dest: '(dashboard)/approvals/page.tsx' },
  { src: '_app.invoices.index.tsx', dest: '(dashboard)/invoices/page.tsx' },
  { src: '_app.invoices.$id.tsx', dest: '(dashboard)/invoices/[id]/page.tsx' },
  { src: '_app.purchase-orders.index.tsx', dest: '(dashboard)/purchase-orders/page.tsx' },
  { src: '_app.purchase-orders.$id.tsx', dest: '(dashboard)/purchase-orders/[id]/page.tsx' },
  { src: '_app.quotations.tsx', dest: '(dashboard)/quotations/page.tsx' },
  { src: '_app.reports.tsx', dest: '(dashboard)/reports/page.tsx' },
  { src: '_app.rfqs.index.tsx', dest: '(dashboard)/rfqs/page.tsx' },
  { src: '_app.rfqs.create.tsx', dest: '(dashboard)/rfqs/create/page.tsx' },
  { src: '_app.rfqs.$id.index.tsx', dest: '(dashboard)/rfqs/[id]/page.tsx' },
  { src: '_app.rfqs.$id.quotations.tsx', dest: '(dashboard)/rfqs/[id]/quotations/page.tsx' },
  { src: '_app.settings.tsx', dest: '(dashboard)/settings/page.tsx' },
  { src: '_app.vendors.tsx', dest: '(dashboard)/vendors/page.tsx' },
  { src: '_app.vendors.$id.tsx', dest: '(dashboard)/vendors/[id]/page.tsx' },
  { src: 'vendor-portal.rfq.$token.tsx', dest: 'vendor-portal/rfq/[token]/page.tsx' },
];

function transformContent(content) {
  // Remove createFileRoute wrapper
  content = content.replace(/import \{ createFileRoute[^}]*\} from "@tanstack\/react-router";/g, '');
  content = content.replace(/export const Route = createFileRoute\([^)]*\)\(\{[\s\S]*?component: [^,]*,?\s*\}\);?/g, '');
  
  // Also remove Link, useNavigate, useParams if imported from @tanstack/react-router
  content = content.replace(/import \{([^}]*)\} from "@tanstack\/react-router";/g, (match, imports) => {
    let newImports = imports.split(',').map(i => i.trim());
    newImports = newImports.filter(i => !['Link', 'useNavigate', 'useParams', 'createFileRoute', 'useRouterState'].includes(i));
    if (newImports.length === 0) return '';
    return `import { ${newImports.join(', ')} } from "@tanstack/react-router";`;
  });

  // Replace Link
  content = content.replace(/<Link\s+to=/g, '<Link href=');
  content = content.replace(/<Link[\s\S]*?<\/Link>/g, (match) => {
    if (match.includes('href=')) {
      return match;
    }
    return match.replace(/to=/g, 'href=');
  });

  // Add Next.js Link import if Link is used
  if (content.includes('<Link ')) {
    content = `import Link from "next/link";\n` + content;
  }

  // Replace useNavigate -> useRouter
  if (content.includes('useNavigate(')) {
    content = `import { useRouter } from "next/navigation";\n` + content;
    content = content.replace(/const navigate = useNavigate\([^)]*\);?/g, 'const router = useRouter();');
    content = content.replace(/navigate\(\{[\s\S]*?to:\s*(`[^`]*`|'[^']*'|"[^"]*")[\s\S]*?\}\)/g, 'router.push($1)');
    content = content.replace(/navigate\(\{[\s\S]*?to:\s*([^,}]+)[\s\S]*?\}\)/g, 'router.push($1)');
  }

  // Replace Route.useParams -> React.use
  if (content.includes('Route.useParams()')) {
    content = content.replace(/const \{([^}]+)\} = Route\.useParams\(\);?/g, 'const { $1 } = React.use(params);');
    // We need to add `params: Promise<any>` to the component props if it doesn't have it
    // This is tricky for a regex, so we'll just inject `params` and `import React`
    if (!content.includes('import React')) {
      content = `import React from "react";\n` + content;
    }
  }

  return content;
}

for (const { src, dest } of mapping) {
  const srcPath = path.join(routesDir, src);
  const destPath = path.join(appDir, dest);
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf-8');
    content = transformContent(content);
    
    // Create directory if not exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // The default export needs to be the component.
    // TanStack files usually just have `function ComponentName() { ... }`
    // We need to find the component name that was passed to createFileRoute and export default it.
    let originalContent = fs.readFileSync(srcPath, 'utf-8');
    let match = originalContent.match(/component:\s*([A-Za-z0-9_]+)/);
    if (match) {
      let compName = match[1];
      if (!content.includes(`export default ${compName}`)) {
        if (content.includes(`export function ${compName}`)) {
           content = content.replace(`export function ${compName}`, `export default function ${compName}`);
        } else if (content.includes(`function ${compName}`)) {
           content = content.replace(`function ${compName}`, `export default function ${compName}`);
        }
      }
    }

    // Add params prop to Next.js page if it uses React.use(params)
    if (content.includes('React.use(params)')) {
       content = content.replace(/(export default function [A-Za-z0-9_]+)\(\s*\)/, '$1({ params }: { params: Promise<any> })');
    }

    fs.writeFileSync(destPath, content);
    console.log(`Migrated ${src} -> ${dest}`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
}
