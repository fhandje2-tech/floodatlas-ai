import fs from 'fs';
let content = fs.readFileSync('src/components/AddressAutocomplete.tsx', 'utf8');

content = content.replace('setLastSearched(r.display_name);\n                setIsOpen(false);', 'setIsOpen(false);');
content = content.replace('setIsOpen(false);              }}', 'setLastSearched(r.display_name);\n                setIsOpen(false);\n              }}');

fs.writeFileSync('src/components/AddressAutocomplete.tsx', content);
