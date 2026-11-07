import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  '<Route path="*" element={<Navigate to="/" replace />} />',
  '</Route>\n        <Route path="*" element={<Navigate to="/" replace />} />'
);
fs.writeFileSync('src/App.tsx', content);
