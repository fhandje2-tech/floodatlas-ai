const fs = require('fs');

// 1. AuthScreen: Save role to store
let authF = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');
if (!authF.includes("useAgentStore.getState().setRole")) {
  authF = authF.replace(/import \{ useAgentStore \} from "\.\.\/stores\/agentStore";/g, ''); // Ensure no dup
  authF = "import { useAgentStore } from '../stores/agentStore';\n" + authF;
  authF = authF.replace(/navigate\("\/onboarding"\);/g, 
    'useAgentStore.getState().setRole(role);\n        navigate("/onboarding");');
  fs.writeFileSync('src/screens/AuthScreen.tsx', authF);
}

// 2. OnboardingScreen: Read role from store if empty
let onbF = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
onbF = onbF.replace(/const \[role, setRole\] = useState\(""\);/,
  'const [role, setRole] = useState(useAgentStore.getState().role || "");');
onbF = onbF.replace(/setName\(userSnap\.data\(\)\.name\?\.split\(" "\)\[0\] \|\| user\?\.displayName\?\.split\(" "\)\[0\] \|\| ""\);/,
  'setName(userSnap.data().name?.split(" ")[0] || user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "");');
onbF = onbF.replace(/\{name \|\| auth\?\.currentUser\?\.displayName\?\.split\(" "\)\[0\] \|\| "User"\}/g,
  '{name || auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "User"}');

// Also update the store if needed
let storeF = fs.readFileSync('src/stores/agentStore.ts', 'utf8');
if (!storeF.includes("setRole: ")) {
  storeF = storeF.replace(/interface AgentState \{/, 'interface AgentState {\n  role: string;\n  setRole: (r: string) => void;');
  storeF = storeF.replace(/activeZone: null,/, 'activeZone: null,\n  role: "",\n  setRole: (role) => set({ role }),');
  fs.writeFileSync('src/stores/agentStore.ts', storeF);
}

fs.writeFileSync('src/screens/OnboardingScreen.tsx', onbF);

