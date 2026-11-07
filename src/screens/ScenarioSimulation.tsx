import React from "react";
import { ScenarioPanel } from "../components/panels/ScenarioPanel";
import { useAgentStore } from "../stores/agentStore";

export function ScenarioSimulation() {
  const { currentProjectId, projects, activeZone } = useAgentStore();
  const currentProject = currentProjectId && projects[currentProjectId] ? projects[currentProjectId] : null;
  const zoneName = currentProject?.activeZone || activeZone || undefined;

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-void">
      <ScenarioPanel zoneName={zoneName} />
    </div>
  );
}
