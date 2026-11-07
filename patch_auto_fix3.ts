import fs from 'fs';
let content = fs.readFileSync('src/components/AddressAutocomplete.tsx', 'utf8');

content = content.replace(
  '  className = ""\n}: {',
  '  className = "",\n  onSelect\n}: {'
);
content = content.replace('  onSelect?: (val: string) => void;\n  placeholder?: string;\n  className?: string;\n  onSelect?: (val: string) => void;\n}', '  onSelect?: (val: string) => void;\n  placeholder?: string;\n  className?: string;\n}');

fs.writeFileSync('src/components/AddressAutocomplete.tsx', content);
