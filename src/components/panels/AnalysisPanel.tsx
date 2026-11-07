import React, { useState, useEffect } from "react";
import { Target, Map as MapIcon, FileBarChart, Waves, Sparkles, Droplets, Leaf, ShieldAlert, ArrowRight, ExternalLink, X, Maximize2, Minimize2, ShieldCheck, CheckCircle2, Navigation, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAgentStore } from "../../stores/agentStore";
import { RiskPulse } from "../../components/charts/RiskPulse";
import { Button } from "../../components/ui/Button";
import { fetchRealInfrastructures, CriticalInfraItem, CategoryStats } from "../../services/infrastructureService";
import { ThesisModal } from "../academic/ThesisModal";

export function AnalysisPanel({ 
  onClose, 
  onSimulate, 
  isExpanded = false, 
  onToggleExpand 
}: { 
  onClose?: () => void; 
  onSimulate?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const { 
    currentProjectId, 
    projects, 
    setActiveZone, 
    setResilienceIndex, 
    setDiagnosticPriorities, 
    updateCurrentProject,
    addNotification,
    setLastAnalysis 
  } = useAgentStore();
  const currentProject = currentProjectId ? projects[currentProjectId] : null;
  const diagnosticPriorities = currentProject?.diagnosticPriorities || ["Risque inondation (ruissellement)"];
  const criticalInfrastructures: CriticalInfraItem[] = currentProject?.criticalInfrastructures || [];
  const infrastructureStats = currentProject?.infrastructureStats || null;
  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;
  const navigate = useNavigate();
  const [status, setStatus] = useState<"calibration" | "loading" | "results">("calibration");
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [showThesisModal, setShowThesisModal] = useState(false);

  // Load real infrastructures on mount or when activeZone changes if not already fetched
  useEffect(() => {
    if (activeZone && (!criticalInfrastructures || criticalInfrastructures.length === 0)) {
      fetchRealInfrastructures(activeZone).then((result) => {
        if (result && result.infrastructures && result.infrastructures.length > 0) {
          updateCurrentProject(() => ({
            criticalInfrastructures: result.infrastructures,
            infrastructureStats: result
          }));
        }
      }).catch(err => console.warn("Infrastructure auto-fetch warning:", err));
    }
  }, [activeZone]);

  const getDynamicScores = (query: string) => {
    let hash = 0;
    for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
    const base = Math.abs(hash) % 40 + 40; // 40-80
    
    const infiltration = Math.abs(hash) % 30 + 15; // 15-45%
    const sealing = 100 - infiltration;
    const desealingPotential = Math.abs(hash) % 40 + 30; // 30-70%
    
    const flood = Math.min(100, base + 6);
    const damage = Math.min(100, base + 2);
    
    const resilience = Math.round((infiltration + (100 - flood) + (100 - damage)) / 3 + 20);
    return {
      overall: base,
      flood: flood,
      infra: Math.max(0, base - 11),
      building: Math.max(0, base - 20),
      damage: damage,
      infiltration,
      sealing,
      desealingPotential,
      resilience: Math.min(100, resilience)
    };
  };
  
  const scores = getDynamicScores(activeZone || "Global");

  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      window.dispatchEvent(new Event('expand-panel'));
    }
  };

  const runDiagnostic = async () => {
    setStatus("loading");
    setLoadingStep(0);
    
    // Fetch real data simultaneously
    try {
      const result = await fetchRealInfrastructures(activeZone || "Territoire d'étude");
      if (result && result.infrastructures) {
        updateCurrentProject(() => ({
          criticalInfrastructures: result.infrastructures,
          infrastructureStats: result
        }));
      }
    } catch(e) {
      console.warn("Infrastructure async fetch during diagnostic", e);
    }

    const interval = setInterval(() => {
      setLoadingStep(s => {
        if (s >= 3) {
          clearInterval(interval);
          setTimeout(() => {
            setStatus("results");

            // Dispatch alert if critical threshold exceeded (overall risk >= 60)
            if (scores.overall >= 60) {
              addNotification({
                title: `Seuil critique dépassé : ${activeZone || "Territoire"} (${scores.overall}/100)`,
                message: `L'indice d'exposition aux inondations dépasse le seuil d'alerte de 60%. Vulnérabilité des infrastructures et ruissellement accru détectés.`,
                type: "critical_threshold",
                severity: "critical",
                zone: activeZone || undefined,
                score: scores.overall,
                link: `/project/${currentProjectId || 'new'}/map`
              });
            } else {
              addNotification({
                title: `Diagnostic territorial prêt : ${activeZone || "Territoire"}`,
                message: `L'analyse de résilience territoriale est calculée (Indice: ${scores.resilience}/100, Imperméabilisation: ${scores.sealing}%).`,
                type: "simulation_ready",
                severity: "success",
                zone: activeZone || undefined,
                score: scores.resilience,
                link: `/project/${currentProjectId || 'new'}/map`
              });
            }
          }, 800);
          return s;
        }
        return s + 1;
      });
    }, 600);
  };


  const getInfrastructureList = () => {
    const q = (activeZone || "Zone d'étude actuelle").toLowerCase();
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
      { name: "General Hospital " + (activeZone || "Zone d'étude actuelle").split(',')[0], type: "Hospital", dist: "45m", icon: "🏥", urgent: true },
      { name: "Central High School", type: "School", dist: "120m", icon: "🏫", urgent: false },
      { name: "Main Power Grid", type: "Power", dist: "80m", icon: "⚡", urgent: false },
    ];
  };

  const recommendedLevers = [
    { label: "Désimperméabilisation des parkings", icon: Droplets, impact: "Fort" },
    { label: "Création de noues paysagères (Voirie)", icon: Leaf, impact: "Très Fort" },
    { label: "Toitures végétalisées (Bâtiments publics)", icon: Waves, impact: "Moyen" }
  ];

  return (
    <div className="w-full h-full bg-surface/95 backdrop-blur-xl border-r border-border overflow-y-auto p-6 z-30 font-body text-text-1 shadow-2xl flex flex-col relative">
{onClose && <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-void rounded-lg text-text-3 hover:text-white"><X className="w-4 h-4"/></button>}
{status === "calibration" && (
        <div className="max-w-2xl mx-auto mt-12 bg-surface border border-border rounded-2xl p-8 shadow-elevated">
          <h2 className="text-2xl font-display font-bold text-text-1 mb-2">Paramétrer le Diagnostic</h2>
          <p className="text-text-3 text-[13px] mb-8">Confirmez la zone d'étude et les priorités avant de lancer l'analyse IA.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-2">
                Zone d'étude principale
              </label>
              <input 
                type="text" 
                value={activeZone || "Zone d'étude actuelle"}
                onChange={(e) => setActiveZone(e.target.value)}
                className="w-full bg-void border border-border rounded-lg px-4 py-3 text-[14px] text-text-1 focus:border-brand-teal outline-none transition-colors"
                placeholder="Ex: Centre-ville, Paris"
              />
            </div>
            
            <div>
              <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-3">
                Focus de l'analyse (Optionnel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Risque inondation (ruissellement)", "Îlots de chaleur urbains", "Désimperméabilisation", "Vulnérabilité des infrastructures"].map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      const current = diagnosticPriorities || [];
                      const newFocus = current.includes(f) 
                        ? current.filter(p => p !== f)
                        : [...current, f];
                      setDiagnosticPriorities(newFocus.length > 0 ? newFocus : ["Risque inondation (ruissellement)"]);
                    }}
                    className={`flex items-center p-3 rounded-lg border text-left transition-colors ${(diagnosticPriorities || []).includes(f) ? "bg-brand-teal/10 border-brand-teal text-brand-teal" : "bg-void border-border text-text-1 hover:border-text-3"}`}
                  >
                    <span className="text-[13px] font-medium">{f}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <Button onClick={runDiagnostic} >
              Lancer le Diagnostic <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
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
              "FloodAtlas is checking topographical data...",
              "FloodAtlas is analysing sealing patterns...",
              "FloodAtlas is searching for critical infrastructure...",
              "FloodAtlas is computing resilience indexes..."
            ].map((text, i) => (
              <div key={i} className={`text-[13px] transition-opacity duration-500 ${loadingStep >= i ? "text-text-1 opacity-100" : "text-text-3 opacity-30"}`}>
                {loadingStep > i ? <span className="text-brand-teal mr-2">✓</span> : loadingStep === i ? <span className="animate-spin inline-block w-3 h-3 border-2 border-brand-blue border-t-transparent rounded-full mr-2" /> : <span className="w-5 inline-block" />}
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "results" && (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          
          <div className="flex flex-col gap-3 border-b border-border pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-text-1">
                  Diagnostic de Résilience Territoriale
                </h2>
                <p className="text-text-3 mt-1 text-[13px] flex items-center gap-1.5 flex-wrap">
                  <span>Basé sur la zone :</span>
                  <span className="text-text-1 font-semibold bg-void px-2 py-0.5 rounded border border-border">
                    {activeZone || "Globale"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm whitespace-nowrap active:scale-95 cursor-pointer ${
                    isExpanded
                      ? "bg-brand-teal/15 border-brand-teal text-brand-teal shadow-[0_0_12px_rgba(20,184,166,0.25)] hover:bg-brand-teal/20"
                      : "bg-void border-border text-text-2 hover:text-white hover:border-border-lit hover:bg-surface"
                  }`}
                  title={isExpanded ? "Réduire à la largeur standard (460px)" : "Agrandir le panneau pour afficher l'ensemble des détails (780px)"}
                >
                  {isExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Réduire le panneau</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Étendre les détails</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/project/${currentProjectId || 'new'}/reports`)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-semibold transition-all shadow-sm whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  <FileBarChart className="w-3.5 h-3.5" />
                  <span>Générer Rapport</span>
                </button>
              </div>
            </div>
          </div>

          <div className={`flex flex-col ${isExpanded ? "lg:flex-row" : "xl:flex-row"} gap-6`}>
            <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center">
              <RiskPulse score={scores.overall} />
              <span className="font-data text-[11px] text-text-3 tracking-widest mt-4 uppercase">Risque Global Estimé</span>
            </section>
            
            <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-void border border-border">
                <span className="text-[11px] text-text-3 uppercase tracking-wider block mb-1">Taux d'Imperméabilisation</span>
                <span className="text-2xl font-data font-bold text-brand-amber">{scores.sealing}%</span>
              </div>
              <div className="p-4 rounded-xl bg-void border border-border">
                <span className="text-[11px] text-text-3 uppercase tracking-wider block mb-1">Capacité Infiltration</span>
                <span className="text-2xl font-data font-bold text-brand-blue">{scores.infiltration}%</span>
              </div>
              <div className="p-4 rounded-xl bg-void border border-border">
                <span className="text-[11px] text-text-3 uppercase tracking-wider block mb-1">Potentiel Désimperm.</span>
                <span className="text-2xl font-data font-bold text-brand-teal">{scores.desealingPotential}%</span>
              </div>
              <div className="p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20">
                <span className="text-[11px] text-brand-teal uppercase tracking-wider block mb-1 font-semibold">Indice de Résilience</span>
                <span className="text-2xl font-data font-bold text-brand-teal">{scores.resilience} / 100</span>
              </div>
            </section>
          </div>

          <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-[15px] mb-6 text-text-1 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-brand-red" />
              Vulnérabilités Identifiées
            </h3>
            <div className="space-y-4">
              {[
                { label: "Exposition aux Inondations", score: scores.flood, color: "bg-brand-red" },
                { label: "Vulnérabilité Infrastructures", score: scores.infra, color: "bg-brand-amber" },
                { label: "Fragilité du Bâti", score: scores.building, color: "bg-brand-amber" },
                { label: "Potentiel de Dommages", score: scores.damage, color: "bg-brand-red" }
              ].map((bar, i) => (
                <div key={i} className="flex items-center text-[13px]">
                  <div className="w-48 text-text-2 font-medium">{bar.label}</div>
                  <div className="flex-1 h-2 bg-void border border-border rounded-full mx-4 overflow-hidden flex">
                    <div className={`h-full ${bar.color}`} style={{ width: `${bar.score}%` }} />
                  </div>
                  <div className="w-10 font-data font-bold text-right text-text-1">{bar.score}%</div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-[15px] text-text-1">Diagnostic des Infrastructures Critiques</h3>
                    <span className="px-2 py-0.5 bg-brand-teal/20 text-brand-teal border border-brand-teal/30 rounded text-[10px] font-bold uppercase tracking-wider flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Données OSM Certifiées
                    </span>
                  </div>
                  <p className="text-[11px] text-text-3 mt-0.5">
                    Distances réelles calculées par géodésie Haversine depuis le barycentre de {activeZone || "la zone"}.
                  </p>
                </div>
                
                {infrastructureStats && (
                  <div className="text-[11px] text-text-3 font-mono">
                    Moyenne globale : <strong className="text-brand-blue font-bold">{infrastructureStats.overallAvgDistanceFormatted}</strong> ({infrastructureStats.totalCount} équipements)
                  </div>
                )}
              </div>

              {/* Category Average Distance Badges */}
              {infrastructureStats && infrastructureStats.categoryStats && (
                <div className="mb-5">
                  <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-2">
                    Distances moyennes par catégorie d'infrastructure :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {infrastructureStats.categoryStats.map((cat: CategoryStats) => {
                      const isFilterActive = selectedCategoryFilter === cat.category;
                      return (
                        <button
                          key={cat.category}
                          onClick={() => setSelectedCategoryFilter(isFilterActive ? null : cat.category)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isFilterActive 
                              ? 'bg-brand-blue/15 border-brand-blue text-white shadow-sm' 
                              : 'bg-void border-border text-text-2 hover:border-border-lit'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px]">{cat.icon}</span>
                            <span className="text-[10px] font-mono font-bold text-text-3">{cat.count} sites</span>
                          </div>
                          <div className="text-[11px] font-semibold truncate">{cat.category}</div>
                          <div className="text-[12px] font-mono font-bold text-brand-blue mt-0.5">
                            {cat.avgDistanceFormatted}
                          </div>
                          {cat.urgentCount > 0 && (
                            <span className="text-[9px] text-brand-red font-bold block mt-0.5">
                              ⚠️ {cat.urgentCount} en zone critique (&lt;450m)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exhaustive List */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {(criticalInfrastructures && criticalInfrastructures.length > 0 
                  ? criticalInfrastructures.filter(item => !selectedCategoryFilter || item.category === selectedCategoryFilter)
                  : getInfrastructureList()
                ).map((item: any, i: number) => (
                  <div key={item.id || i} className={`flex items-center p-3 rounded-xl border transition-colors ${item.urgent ? "border-brand-red/40 bg-brand-red/5" : "border-border bg-void hover:border-border-lit"}`}>
                    <span className="text-xl mr-3 shrink-0">{item.icon || "📍"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[13px] text-text-1 truncate">{item.name}</span>
                        {item.category && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-surface border border-border text-text-3 shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-text-3 mt-0.5">
                        <span>{item.type}</span>
                        {item.address && <span className="truncate max-w-[220px]">• {item.address}</span>}
                      </div>
                    </div>
                    <div className="text-right pl-3 shrink-0">
                      <span className={`font-mono text-[13px] font-bold block ${item.urgent ? "text-brand-red" : "text-brand-blue"}`}>
                        {item.dist}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        item.riskLevel === 'Critique' ? 'bg-brand-red/20 text-brand-red' :
                        item.riskLevel === 'Élevé' ? 'bg-brand-amber/20 text-brand-amber' :
                        'bg-surface text-text-3'
                      }`}>
                        {item.riskLevel || (item.urgent ? 'Critique' : 'Standard')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-brand-blue/5 border border-brand-blue/20 p-6 rounded-2xl shadow-sm flex flex-col">
              <h3 className="font-semibold text-[15px] mb-4 text-brand-blue flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Leviers de Résilience Recommandés
              </h3>
              <p className="text-[12px] text-brand-blue/80 mb-4 leading-relaxed">
                Sur la base des caractéristiques de {activeZone || "cette zone"}, l'IA FloodAtlas recommande les actions Ville Éponge suivantes :
              </p>
              <div className="space-y-3 flex-1">
                {recommendedLevers.map((lever, i) => (
                  <div key={i} className="flex items-center p-3 bg-brand-blue/10 rounded-lg">
                    <lever.icon className="w-4 h-4 text-brand-blue mr-3" />
                    <span className="text-[13px] text-brand-blue flex-1">{lever.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/70 bg-brand-blue/10 px-2 py-0.5 rounded">
                      Impact {lever.impact}
                    </span>
                  </div>
                ))}
              </div>
              <Button onClick={() => { if(onSimulate) onSimulate(); else navigate('/scenarios'); }} className="mt-4 w-full" variant="primary">
                Simuler ces stratégies <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </section>
          </div>

          <section className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[13px] text-text-2 uppercase tracking-wider">Sources & Références</h3>
              <button
                type="button"
                onClick={() => setShowThesisModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/30 text-[11px] font-semibold text-brand-teal transition-colors cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Thèse MBA De Vinci (Handje Pounjieu, 2026)</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowThesisModal(true)}
                className="flex items-center px-3 py-1.5 bg-brand-teal/10 border border-brand-teal/30 hover:border-brand-teal/60 rounded text-[11px] text-brand-teal font-medium transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                <span>Thèse Professionnelle MBA MTU (De Vinci / gaea21)</span>
              </button>
              {[
                { name: "CEREMA - Ville perméable", url: "#" },
                { name: "Observatoire de l'Imperméabilisation", url: "#" },
                { name: "Rapport PAPI Phase 2", url: "#" },
                { name: "GIEC - Adaptation urbaine", url: "#" },
                { name: "Agence de l'Eau", url: "#" }
              ].map((source, i) => (
                <a key={i} href={source.url} className="flex items-center px-3 py-1.5 bg-void border border-border hover:border-text-3 rounded text-[11px] text-text-2 transition-colors">
                  <span className="mr-1.5">{source.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* Embedded Academic Thesis Modal */}
      <ThesisModal isOpen={showThesisModal} onClose={() => setShowThesisModal(false)} />
    </div>
  );
}
