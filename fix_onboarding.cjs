const fs = require('fs');
let file = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

file = file.replace(
  /setName\(userSnap\.data\(\)\.name\?\.split\(" "\)\[0\] \|\| ""\);/,
  'setName(userSnap.data().name?.split(" ")[0] || user?.displayName?.split(" ")[0] || "");'
);
file = file.replace(
  /setRole\(userSnap\.data\(\)\.role \|\| ""\);/,
  'setRole(userSnap.data().role || "");'
);

// We need to also use user.displayName fallback in render if name is empty
file = file.replace(
  /\{name \|\| "User"\}/g,
  '{name || auth?.currentUser?.displayName?.split(" ")[0] || "User"}'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', file);
