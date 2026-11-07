import fs from 'fs';

let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

// Replace standard navigate("/dashboard") inside handleAuthSuccess and auto-login
content = content.replace(/navigate\("\/dashboard"\);/g, 'navigate(useAgentStore.getState().lastVisitedPath || "/dashboard");');

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
