import fs from 'fs';
let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

content = content.replace('console.error("Email Auth Error:", err);', '// Expected user error');
content = content.replace('console.error("Google Auth Error:", err);', '// Expected user error');
content = content.replace('console.error("Password reset error:", err);', '// Expected user error');

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
