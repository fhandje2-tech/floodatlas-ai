import React, { useEffect, useState } from "react";
import { Outlet, useLocation, Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAgentStore } from "../../stores/agentStore";
import { X, Home, Plus, LayoutPanelLeft, Target, Map as MapIcon, FileBarChart, Waves, Sparkles, Settings as SettingsIcon, GraduationCap, ShieldCheck } from "lucide-react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AIAssistant } from "../../screens/AIAssistant";
import { NotificationBell } from "../notifications/NotificationBell";
import { ThesisModal } from "../academic/ThesisModal";

export function AppShell() {
  const { setZones, setActiveZone, setLanguage, setMessages, role, setCurrentProject, currentProjectId, projects, setLastVisitedPath } = useAgentStore();
  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;
  const { id } = useParams();
  const { i18n, t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();

  const [showThesisModal, setShowThesisModal] = useState(false);

  const handleNewProject = () => {
    setActiveZone(null);
    navigate('/new-project');
  };

  useEffect(() => {
    // Keep i18n and agentStore synchronized from persistent storage
    const storedLang = useAgentStore.getState().language || localStorage.getItem("sponge_city_lang");
    if (storedLang) {
      if (i18n.language !== storedLang) {
        i18n.changeLanguage(storedLang);
      }
      document.documentElement.lang = storedLang;
      document.documentElement.dir = storedLang === "ar" ? "rtl" : "ltr";
    }
    if (id && id !== currentProjectId) {
      setCurrentProject(id);
    }
  }, [id, currentProjectId, setCurrentProject, i18n]);

  useEffect(() => {
    const fetchUserContext = async () => {
      if (auth && auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.zones && Array.isArray(userData.zones)) {
            setZones(userData.zones);
            if (!activeZone && userData.zones.length > 0) {
              setActiveZone(userData.zones[0]);
            }
          }
          const localLang = localStorage.getItem("sponge_city_lang");
          if (localLang && ["fr", "en", "de", "ar"].includes(localLang)) {
            if (userData.language !== localLang) {
              setDoc(userRef, { language: localLang }, { merge: true }).catch(() => {});
            }
          } else if (userData.language && ["fr", "en", "de", "ar"].includes(userData.language)) {
            setLanguage(userData.language);
            if (i18n.language !== userData.language) {
              i18n.changeLanguage(userData.language);
            }
          }
        }
      }
    };
    fetchUserContext();
  }, [setZones, setActiveZone, activeZone, setLanguage, i18n]);

  const isDashboard = location.pathname === '/dashboard';
  const isNewProject = location.pathname === '/new-project';
  const isSettings = location.pathname === '/settings';
  const isChatOnly = location.pathname.includes("/assistant") || false;
  const defaultProjectId = currentProjectId || Object.keys(projects || {})[0] || "new";

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0F19] text-text-1 overflow-hidden font-body">
      
      {/* Top Bar matching minimalist design */}
      <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-white/5 bg-void">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-text-2 hover:text-white transition-colors flex items-center text-[13px] font-medium">
            <Home className="w-4 h-4 mr-2" />
            {t("nav.home") || "Accueil"}
          </Link>
          <div className="h-4 w-px bg-white/10" />
          
          <Link to={`/project/${defaultProjectId}/assistant`} className={`transition-colors flex items-center text-[13px] font-semibold ${isChatOnly ? 'text-brand-blue' : 'text-text-3 hover:text-white'}`}>
            <Sparkles className="w-4 h-4 mr-2" />
            {t("nav.assistant") || "Assistant IA"}
          </Link>

          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center space-x-4">
            <Link to={`/project/${defaultProjectId}/map`} className={`transition-colors flex items-center text-[13px] font-medium ${location.pathname.includes("/map") ? 'text-white' : 'text-text-3 hover:text-white'}`}>
              <MapIcon className="w-4 h-4 mr-2" />
              {t("nav.mapping") || "Cartographie"}
            </Link>
            
            <Link to={`/project/${defaultProjectId}/reports`} className={`transition-colors flex items-center text-[13px] font-medium ${location.pathname.includes("/reports") ? 'text-white' : 'text-text-3 hover:text-white'}`}>
              <FileBarChart className="w-4 h-4 mr-2" />
              {t("nav.reports") || "Rapports"}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-2.5">
          {/* Academic MBA Thesis Button */}
          <button
            type="button"
            onClick={() => setShowThesisModal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-brand-teal/30 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Consulter les travaux de recherche : Thèse de MBA De Vinci / gaea21"
          >
            <GraduationCap className="w-3.5 h-3.5 text-brand-teal" />
            <span className="hidden sm:inline">Thèse MBA De Vinci</span>
          </button>

          {/* RGPD & Data Sovereignty Quick Link */}
          <Link
            to="/settings"
            state={{ defaultTab: "privacy" }}
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface/60 hover:bg-surface text-text-3 hover:text-brand-teal text-xs font-medium transition-all"
            title="Consulter la gouvernance des données, la conformité RGPD et les options de stockage souverain"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
            <span>RGPD & Souveraineté</span>
          </Link>

          <button 
            className="flex items-center px-3 py-1.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            onClick={handleNewProject}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t("nav.newProject") || "Nouveau Projet"}
          </button>

          {/* In-App Notification Center */}
          <NotificationBell />

          {/* Settings link or Close button if currently in settings */}
          {isSettings ? (
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/dashboard');
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-2 hover:text-text-1 hover:bg-elevated text-xs font-medium transition-colors"
              title="Fermer les paramètres"
            >
              <X className="w-3.5 h-3.5 text-text-3" />
              <span>Fermer</span>
            </button>
          ) : (
            <Link
              to="/settings"
              className="p-2 rounded-lg border border-border/80 bg-surface/80 text-text-3 hover:text-text-1 hover:bg-elevated transition-colors"
              title={t("nav.settings") || "Paramètres"}
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          )}
          
          <Link to="/settings" className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-2 text-xs font-bold shadow-sm hover:border-brand-teal transition-colors" title="Profil & Paramètres">
            {auth?.currentUser?.displayName?.[0] || auth?.currentUser?.email?.[0]?.toUpperCase() || "U"}
          </Link>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        {isDashboard || isSettings || isNewProject ? (
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        ) : (
          <div className="flex-1 relative flex">
             {isChatOnly ? (
               <div className="w-full max-w-4xl mx-auto flex flex-col transition-all duration-300">
                 <AIAssistant isSplit={false} />
               </div>
             ) : (
               <Outlet />
             )}
          </div>
        )}
      </main>

      {/* Academic MBA Thesis Presentation & Document Viewer */}
      <ThesisModal isOpen={showThesisModal} onClose={() => setShowThesisModal(false)} />
    </div>
  );
}
