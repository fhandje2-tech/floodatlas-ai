import React from "react";
import { Bell } from "lucide-react";
import { useLocation } from "react-router";
import { useAgentStore } from "../../stores/agentStore";

import { NotificationBell } from "../notifications/NotificationBell";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analysis": "Territory Analysis",
  "/map": "Smart Mapping",
  "/assistant": "AI Assistant",
  "/reports": "Reports",
  "/scenarios": "Scenario Simulation",
  "/settings": "Settings",
};

export function TopBar() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "FloodAtlas AI";
  const { currentProjectId, projects, zones, setActiveZone } = useAgentStore();
  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;
  const displayZones = Array.from(new Set([
    ...(activeZone ? [activeZone] : []),
    ...(zones || [])
  ]));

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center w-1/3">
        <h1 className="text-[15px] font-semibold text-text-1 font-body">{title}</h1>
      </div>

      <div className="flex items-center justify-center w-1/3">
        {/* Zone Selector */}
        {displayZones.length > 0 && (
          <select 
            className="h-8 bg-elevated border border-border rounded-md px-3 text-xs text-text-1 font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue"
            value={activeZone || displayZones[0]}
            onChange={(e) => setActiveZone(e.target.value)}
          >
            {displayZones.map((z) => (
              <option key={z} value={z}>
                {z.split(",")[0]} {activeZone === z ? "(Actif)" : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center justify-end w-1/3 space-x-4">
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center text-brand-teal text-xs font-bold cursor-pointer hover:border-brand-teal transition-colors">
          FH
        </div>
      </div>
    </header>
  );
}
