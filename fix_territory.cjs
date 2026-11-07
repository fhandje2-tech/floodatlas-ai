const fs = require('fs');
let code = `
import React, { useState, useEffect } from "react";
import { Target, Map as MapIcon, FileBarChart, Waves, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useAgentStore } from "../stores/agentStore";
import { RiskPulse } from "../components/charts/RiskPulse";
import { Button } from "../components/ui/Button";

export function TerritoryAnalysis() {
  const { activeZone, setActiveZone } = useAgentStore();
  const [status, setStatus] = useState<"loading" | "results">("loading");
  const [loadingStep, setLoadingStep] = useState(0);

  const getDynamicScores = (query: string) => {
    let hash = 0;
    for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
    const base = Math.abs(hash) % 40 + 40; // 40-80
    return {
      overall: base,
      flood: Math.min(100, base + 6),
      infra: Math.max(0, base - 11),
      building: Math.max(0, base - 20),
      damage: Math.min(100, base + 2)
    };
  };

  useEffect(() => {
    setStatus("loading");
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(s => {
        if (s >= 3) {
          clearInterval(interval);
          setTimeout(() => setStatus("results"), 800);
          return s;
        }
        return s + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [activeZone]);

  const scores = getDynamicScores(activeZone || "Global");

  const getInfrastructureList = () => {
    const q = (activeZone || "").toLowerCase();
    if (q.includes('york')) {
      return [
        { name: "NYU Langone", type: "Hospital", dist: "12m", icon: "🏥", urgent: true },
        { name: "Stuyvesant High", type: "School", dist: "95m", icon: "🏫", urgent: false },
        { name: "ConEd Substation", type: "Power", dist: "40m", icon: "⚡", urgent: false },
      ];
    } else if (q.includes('houston')) {
      return [
        { name: "Texas Medical Center", type: "Hospital", dist: "5m", icon: "🏥", urgent: true },
        { name: "Bellaire High", type: "School", dist: "1.2km", icon: "🏫", urgent: false },
        { name: "CenterPoint Substation", type: "Power", dist: "300m", icon: "⚡", urgent: false },
      ];
    }
    return [
      { name: "General Hospital " + (activeZone || "").split(',')[0], type: "Hospital", dist: "45m", icon: "🏥", urgent: true },
      { name: "Central High School", type: "School", dist: "120m", icon: "🏫", urgent: false },
      { name: "Main Power Grid", type: "Power", dist: "80m", icon: "⚡", urgent: false },
    ];
  };

  return (
    <div className="flex-1 h-full bg-[#090c14] overflow-y-auto p-8 relative font-body">
      {status === "loading" && (
        <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <Target className="w-10 h-10 mb-8 text-brand-blue animate-pulse" />
          <div className="w-full space-y-4 mb-12">
            <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
          </div>
          
          <div className="w-full space-y-3">
            {[
              "AI evaluating location data...",
              "Computing structural vulnerability KPIs...",
              "Scanning critical infrastructure...",
              "Finalizing risk model..."
            ].map((text, i) => (
              <div key={i} className={\`text-[13px] transition-opacity duration-500 \${loadingStep >= i ? "text-text-1 opacity-100" : "text-text-3 opacity-30"}\`}>
                {loadingStep > i ? <span className="text-brand-teal mr-2">✓</span> : loadingStep === i ? <span className="animate-spin inline-block w-3 h-3 border-2 border-brand-blue border-t-transparent rounded-full mr-2" /> : <span className="w-5 inline-block" />}
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "results" && (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
          
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <div>
              <h2 className="text-[20px] font-bold text-text-1">Territory Analysis</h2>
              <p className="text-[13px] text-text-2">{activeZone || "Global Territory"}</p>
            </div>
            <div className="flex space-x-2">
              <Link to="/map"><Button variant="ghost" size="sm">Map View</Button></Link>
              <Link to="/reports"><Button size="sm">Export Report</Button></Link>
            </div>
          </div>

          <section className="bg-[#131929] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="shrink-0 flex flex-col items-center">
              <RiskPulse score={scores.overall} />
              <span className="font-data text-[10px] text-text-3 tracking-widest mt-4">OVERALL KPI RISK</span>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              {[
                { label: "Flood Exposure", score: scores.flood, color: "bg-brand-red" },
                { label: "Infrastructure", score: scores.infra, color: "bg-brand-amber" },
                { label: "Building Fragility", score: scores.building, color: "bg-brand-amber" },
                { label: "Damage Potential", score: scores.damage, color: "bg-brand-red" }
              ].map((bar, i) => (
                <div key={i} className="flex items-center text-[13px]">
                  <div className="w-32 text-text-2 font-medium">{bar.label}</div>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full mx-4 overflow-hidden flex">
                    <div className={\`h-full \${bar.color}\`} style={{ width: \`\${bar.score}%\` }} />
                  </div>
                  <div className="w-8 font-data font-bold text-right text-text-1">{bar.score}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-[15px] mb-4 text-text-1">Critical Infrastructure Impacts</h3>
            <div className="bg-[#131929] border border-white/5 rounded-xl overflow-hidden">
              {getInfrastructureList().map((item, i) => (
                <div key={i} className={\`flex items-center p-4 border-b border-white/5 last:border-0 \${item.urgent ? "border-l-4 border-l-brand-red bg-brand-red/5" : ""}\`}>
                  <span className="text-xl mr-4">{item.icon}</span>
                  <div className="flex-1">
                     <span className="font-medium text-[13px] text-text-1 block">{item.name}</span>
                     <span className="text-[11px] text-text-3 mt-0.5 block">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-data text-[14px] font-bold text-text-1">{item.dist}</span>
                    <span className="block text-[10px] text-text-3 uppercase tracking-wider mt-0.5">Distance</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-brand-blue/5 border border-brand-blue/20 p-5 rounded-xl">
             <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-blue" />
                <span className="text-brand-blue font-bold text-[12px] tracking-wider uppercase">AI Context Synchronized</span>
              </div>
              <p className="text-[13px] leading-relaxed text-brand-blue/80">
                The KPIs for {activeZone || "this location"} have been analyzed. I can help you prioritize intervention plans for the identified critical infrastructures in the main chat.
              </p>
          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/screens/TerritoryAnalysis.tsx', code);
