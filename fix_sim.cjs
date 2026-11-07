const fs = require('fs');

let file = fs.readFileSync('src/screens/ScenarioSimulation.tsx', 'utf8');

if (!file.includes("useAgentStore")) {
  file = file.replace(/import \{ Button \} from "\.\.\/components\/ui\/Button";/, 
  'import { Button } from "../components/ui/Button";\nimport { useAgentStore } from "../stores/agentStore";');
  
  file = file.replace(/export function ScenarioSimulation\(\) \{/, 
  'export function ScenarioSimulation() {\n  const { activeZone, setActiveZone, zones } = useAgentStore();');
}

fs.writeFileSync('src/screens/ScenarioSimulation.tsx', file);
