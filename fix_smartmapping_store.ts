import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(
  `const { setActiveZone, role, currentProjectId, projects, setMessages, diagnosticPriorities, setCriticalInfrastructures, criticalInfrastructures } = useAgentStore();`,
  `const { setActiveZone, role, currentProjectId, projects, setMessages, setCriticalInfrastructures } = useAgentStore();
  const currentProject = currentProjectId ? projects[currentProjectId] : null;
  const diagnosticPriorities = currentProject?.diagnosticPriorities || ["Risque inondation (ruissellement)"];
  const criticalInfrastructures = currentProject?.criticalInfrastructures || [];`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("SmartMapping fixed");
