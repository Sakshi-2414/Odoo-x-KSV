import fs from 'fs';
[
  'app/(dashboard)/rfqs/create/page.tsx',
  'app/(auth)/login/page.tsx'
].forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/const navigate = useNavigate\([^)]*\);?/g, 'const router = useRouter();');
  content = content.replace(/navigate\(\{[\s\S]*?to:\s*(`[^`]*`|'[^']*'|"[^"]*")[\s\S]*?\}\)/g, 'router.push($1)');
  content = content.replace(/navigate\(\{[\s\S]*?to:\s*([^,}]+)[\s\S]*?\}\)/g, 'router.push($1)');
  fs.writeFileSync(file, content);
});
