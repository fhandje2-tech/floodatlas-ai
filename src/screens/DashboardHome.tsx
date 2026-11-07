
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Target, Map as MapIcon, Sparkles, FileBarChart, Waves, Plus, ArrowRight, Trash2, AlertTriangle, GraduationCap, BookOpen, Download, ShieldCheck, CheckCircle2, Palette } from "lucide-react";
import { useAgentStore } from "../stores/agentStore";
import { Button } from "../components/ui/Button";
import { ThesisModal } from "../components/academic/ThesisModal";

export function DashboardHome() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { projects, setCurrentProject, deleteProject, language } = useAgentStore();
  const navigate = useNavigate();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showThesisModal, setShowThesisModal] = useState(false);
  const projectList = Object.values(projects || {}).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const modules = [
    { 
      name: t("modules.mapping.name", "Cartographie & Diagnostic IA"), 
      icon: MapIcon, 
      desc: t("modules.mapping.desc", "SmartMapping"), 
      link: "map", 
      color: "text-brand-blue" 
    },
    { 
      name: t("modules.reports.name", "Génération de Rapports"), 
      icon: FileBarChart, 
      desc: t("modules.reports.desc", "Notes & Bilans"), 
      link: "reports", 
      color: "text-text-1" 
    }
  ];

  return (
    <div className="flex-1 h-full bg-[#090c14] overflow-y-auto p-8 font-body text-text-1">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              {t("title", "Tableau de Bord")}
            </h1>
            <p className="text-text-2 text-[14px]">
              {t("subtitle", "Gérez vos territoires et accédez aux modules d'analyse de résilience.")}
            </p>
          </div>
          <Button onClick={() => navigate("/new-project")} variant="primary" className="shadow-elevated">
            <Plus className="w-4 h-4 mr-2" /> {t("newProject", "Nouveau Projet")}
          </Button>
        </div>

        {/* Academic Research & MBA Thesis Highlight Banner */}
        <div className="rounded-2xl border border-brand-teal/30 bg-gradient-to-r from-[#0b1728] via-surface to-[#0a1e24] p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start space-x-4 max-w-3xl">
              <div className="p-3.5 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 text-brand-teal shrink-0 shadow-[0_0_20px_rgba(20,184,166,0.25)]">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                    Thèse Professionnelle de MBA &bull; De Vinci
                  </span>
                  <span className="text-[11px] font-mono text-text-3">
                    Mission gaea21 &bull; Dir. Laurent JULVEZ
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-display text-text-1">
                  De la gestion de crise à la résilience territoriale
                </h3>
                <p className="text-xs text-text-2 leading-relaxed">
                  Travaux de recherche et méthodologie conçus par <strong>Fabien Aimé HANDJE POUNJIEU</strong> (MBA Management des Transitions Urbaines et Développement des Territoires &mdash; De Vinci, mission au sein de gaea21 sous la direction pédagogique de Laurent JULVEZ).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowThesisModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal border border-brand-teal/40 font-semibold text-xs transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Découvrir la Thèse</span>
              </button>

              <a
                href="/assets/aistudio/Memoire_Fabien_HANDJE_MTU__1___1__89edad6c.pdf"
                download="Memoire_Fabien_HANDJE_FloodAtlas_AI_MBA_MTU.pdf"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
                title="Télécharger le mémoire complet (PDF)"
              >
                <Download className="w-4 h-4" />
                <span>PDF (57 pages)</span>
              </a>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-text-3 mb-6">
            {t("expertModules", "Modules Experts")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {modules.map((mod, i) => (
              <Link 
                key={i} 
                to={projectList.length > 0 ? `/project/${projectList[0].id}/${mod.link}` : "/new-project"}
                className="bg-surface border border-border rounded-xl p-5 hover:border-brand-teal hover:shadow-card transition-all group block relative overflow-hidden"
              >
                <div className="mb-4">
                  <mod.icon className={`w-6 h-6 ${mod.color} group-hover:scale-110 transition-transform`} />
                </div>
                <h4 className="font-semibold text-[14px] text-text-1 mb-1 leading-tight group-hover:text-brand-teal transition-colors">{mod.name}</h4>
                <p className="text-[11px] text-text-2">{mod.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-text-3 mb-6">
            {t("recentProjects", "Vos Projets Récents")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectList.length > 0 ? projectList.map((project) => (
              <div key={project.id} className="bg-surface border border-border rounded-2xl p-6 flex flex-col hover:border-text-3 transition-colors group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-4">
                    <h3 className="font-semibold text-[16px] text-text-1 group-hover:text-brand-teal transition-colors mb-1">{project.name}</h3>
                    <p className="text-[12px] text-text-3 flex items-center">
                      <MapIcon className="w-3 h-3 mr-1" /> {project.activeZone || t("territory", "Territoire")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] font-medium text-text-3 uppercase bg-void px-2 py-1 rounded">
                      {new Date(project.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setProjectToDelete(project.id)}
                      className="p-1.5 rounded-lg text-text-3 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
                      title={t("actions.delete", "Supprimer")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
                  <span className="text-[12px] font-medium text-text-2">{t("openProject", "Ouvrir")}</span>
                  <div className="flex space-x-2">
                    <Link to={`/project/${project.id}/assistant`} onClick={() => setCurrentProject(project.id)}>
                      <Button variant="secondary" size="sm" className="h-8 px-3 text-[12px] bg-void hover:bg-elevated">
                        <Sparkles className="w-3 h-3 mr-1.5 text-brand-blue" /> {t("nav.assistant", "Assistant")}
                      </Button>
                    </Link>
                    <Link to={`/project/${project.id}/map`} onClick={() => setCurrentProject(project.id)}>
                      <Button variant="secondary" size="sm" className="h-8 px-3 text-[12px] bg-void hover:bg-elevated">
                        <MapIcon className="w-3 h-3 mr-1.5" /> {t("openProject", "Carte")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center bg-surface border border-dashed border-border rounded-2xl">
                <p className="text-text-2 mb-4">{t("noProjects", "Aucun projet trouvé. Créez un nouveau projet pour commencer.")}</p>
                <Button onClick={() => navigate("/new-project")} variant="secondary">
                  {t("newProject", "Nouveau Projet")} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Trust, RGPD Sovereignty & Quality Governance Footer Bar */}
        <div className="pt-6 border-t border-border/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            <span>Open Source &bull; Données isolées UE (europe-west1) &bull; Souveraineté territoriale</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/settings"
              state={{ defaultTab: "privacy" }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-elevated text-text-2 hover:text-white border border-border transition-colors font-medium cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
              <span>Charte RGPD & Portabilité (.json)</span>
            </Link>

            <Link
              to="/settings"
              state={{ defaultTab: "quality" }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-elevated text-text-2 hover:text-white border border-border transition-colors font-medium cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
              <span>Garanties Sources & Multilingue</span>
            </Link>

            <Link
              to="/settings"
              state={{ defaultTab: "appearance" }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-elevated text-text-2 hover:text-white border border-border transition-colors font-medium cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-brand-amber" />
              <span>Options de Contraste (WCAG AAA)</span>
            </Link>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-elevated space-y-4">
              <div className="flex items-center space-x-3 text-brand-red">
                <div className="p-2.5 rounded-full bg-brand-red/10">
                  <AlertTriangle className="w-5 h-5 text-brand-red" />
                </div>
                <h3 className="text-lg font-semibold text-text-1">
                  {t("deleteProjectConfirmTitle", "Supprimer ce projet ?")}
                </h3>
              </div>
              <p className="text-[13px] text-text-2 leading-relaxed">
                {t("deleteProjectConfirmDesc", "Cette action est irréversible. L'ensemble des données cartographiques, scénarios et analyses de ce projet seront supprimés.")}
              </p>
              <div className="flex justify-end space-x-3 pt-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setProjectToDelete(null)}
                >
                  {t("actions.cancel", "Annuler")}
                </Button>
                <Button 
                  variant="primary" 
                  className="bg-brand-red hover:bg-brand-red/90 text-white border-0"
                  onClick={() => {
                    deleteProject(projectToDelete);
                    setProjectToDelete(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> {t("actions.delete", "Supprimer")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Academic MBA Thesis Presentation & Document Viewer */}
        <ThesisModal isOpen={showThesisModal} onClose={() => setShowThesisModal(false)} />

      </div>
    </div>
  );
}
