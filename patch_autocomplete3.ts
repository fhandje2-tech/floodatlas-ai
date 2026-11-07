import fs from 'fs';
let content = fs.readFileSync('src/components/AddressAutocomplete.tsx', 'utf8');

// Change onSelect signature to pass the full object if needed, or just keep string but we can fetch lat/lon in SmartMapping.
// Actually, let's just pass the full object.
content = content.replace(
  'onSelect?: (val: string) => void;',
  'onSelect?: (val: string, result?: any) => void;'
);
content = content.replace(
  'if (onSelect) onSelect(r.display_name);',
  'if (onSelect) onSelect(r.display_name, r);'
);

fs.writeFileSync('src/components/AddressAutocomplete.tsx', content);
