import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18next from 'i18next';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface ProjectState {
  id: string;
  name: string;
  activeZone: string | null;
  context?: string;
  messages: any[];
  lastAnalysis: any | null;
  lastScenario: any | null;
  reportDraft: any | null;
  selectedLevers: string[];
  resilienceIndex: number;
  diagnosticPriorities: string[];
  criticalInfrastructures: any[];
  infrastructureStats?: any;
  scenarioImage?: string | null;
  beforeImage?: string | null;
  renderedMetadata?: any;
  scenarioAssumptions?: any | null;
  createdAt: string;
}

interface AgentState {
  // Global settings
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  role: string;
  setRole: (r: string) => void;
  zones: string[];
  setZones: (zones: string[]) => void;
  language: string;
  setLanguage: (lang: string) => void;
  contextPanelContent: any | null;
  contextPanelOpen: boolean;
  setContextPanelOpen: (open: boolean) => void;
  setContextPanelContent: (content: any) => void;
  lastVisitedPath: string | null;
  setLastVisitedPath: (path: string | null) => void;

  // Projects
  projects: Record<string, ProjectState>;
  currentProjectId: string | null;

  createProject: (name: string, activeZone: string | null, lang?: string, context?: string) => string;
  setCurrentProject: (id: string | null) => void;
  deleteProject: (id: string) => void;
  updateCurrentProject: (updater: (draft: ProjectState) => Partial<ProjectState>) => void;

  // Compatibility getters/setters for current project
  get messages(): any[];
  setMessages: (updater: any) => void;
  get activeZone(): string | null;
  setActiveZone: (zone: string | null) => void;
  get lastAnalysis(): any | null;
  setLastAnalysis: (analysis: any) => void;
  get lastScenario(): any | null;
  setLastScenario: (scenario: any) => void;
  get reportDraft(): any | null;
  get selectedLevers(): string[];
  setSelectedLevers: (levers: string[]) => void;
  get diagnosticPriorities(): string[];
  setDiagnosticPriorities: (priorities: string[]) => void;
  get criticalInfrastructures(): any[];
  setCriticalInfrastructures: (infras: any[]) => void;
  get infrastructureStats(): any | null;
  setInfrastructureStats: (stats: any) => void;
  get resilienceIndex(): number;
  setResilienceIndex: (index: number) => void;

  // Notification System
  notifications: AppNotification[];
  audioNotificationEnabled: boolean;
  setAudioNotificationEnabled: (enabled: boolean) => void;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read"> & { id?: string; timestamp?: string; read?: boolean }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;

  // Sovereign Storage & RGPD Data Governance
  storageMode: 'hybrid' | 'local_only';
  setStorageMode: (mode: 'hybrid' | 'local_only') => void;
  exportTerritorialArchive: () => void;
  importTerritorialArchive: (jsonContent: string) => boolean;
  purgeAllUserData: () => Promise<void>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "simulation_ready" | "critical_threshold" | "warning" | "info";
  severity: "critical" | "warning" | "success" | "info";
  timestamp: string;
  read: boolean;
  link?: string;
  zone?: string;
  score?: number;
}


const generateWelcomeMessage = (lang: string, role?: string, activeZone?: string | null) => {
  const roleText = role ? ` pour un profil ${role}` : '';
  const zoneText = activeZone ? ` sur le territoire de ${activeZone}` : '';
  
  const roleTextEn = role ? ` for a ${role} profile` : '';
  const zoneTextEn = activeZone ? ` in the territory of ${activeZone}` : '';
  
  const messages: Record<string, string> = {
    fr: `Bonjour ! En tant que conseiller expert en résilience territoriale, j'ai initialisé votre espace de travail${zoneText}. Je suis prêt à analyser vos aléas climatiques et à concevoir des stratégies "Ville Éponge" adaptées à vos enjeux stratégiques${roleText}. Par quoi voulez-vous commencer ?`,
    en: `Hello! As an expert advisor in territorial resilience, I have initialized your workspace${zoneTextEn}. I am ready to analyze your climate risks and design "Sponge City" strategies adapted to your strategic challenges${roleTextEn}. Where would you like to start?`,
    de: "Hallo! Als Experte für territoriale Resilienz kann ich Ihre Klimarisiken analysieren und Strategien entwerfen. Womit möchten Sie beginnen?",
    ar: "مرحباً! بصفتي مستشاراً خبيراً في المرونة الإقليمية، يمكنني تحليل المخاطر المناخية. من أين تريد أن تبدأ؟"
  };
  return {
    id: "welcome",
    role: "ai",
    content: messages[lang] || messages.en,
    timestamp: new Date().toISOString()
  };
};



export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      // Global settings
      isTyping: false,
      setIsTyping: (typing) => set({ isTyping: typing }),
      role: "",
      setRole: (role) => set({ role }),
      zones: [],
      setZones: (zones) => set({ zones }),
      language: "fr", // Fallback, managed by i18n
      setLanguage: (lang) => {
        const code = (lang || 'fr').slice(0, 2).toLowerCase();
        try {
          localStorage.setItem("sponge_city_lang", code);
          localStorage.setItem("i18nextLng", code);
          if (typeof document !== "undefined") {
            document.documentElement.lang = code;
            document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
          }
        } catch (e) {}
        if (i18next && i18next.language !== code) {
          i18next.changeLanguage(code);
        }
        set({ language: code });
        if (auth && auth.currentUser) {
          setDoc(doc(db, "users", auth.currentUser.uid), { language: code }, { merge: true }).catch(() => {});
        }
      },
      contextPanelContent: null,
      lastVisitedPath: null,
      setLastVisitedPath: (path) => set({ lastVisitedPath: path }),
      contextPanelOpen: false,
      setContextPanelOpen: (open) => set({ contextPanelOpen: open }),
      setContextPanelContent: (content) => set({ contextPanelContent: content, contextPanelOpen: true }),

      // Projects
      projects: {},
      currentProjectId: null,

      createProject: (name, activeZone, lang, context = "") => {
        const currentRole = get().role;
        const currentLang = lang || get().language || "fr";
        const id = Date.now().toString();
        const newProject: ProjectState = {
          id,
          name,
          activeZone,
          context,
          messages: [generateWelcomeMessage(currentLang, currentRole, activeZone)],
          lastAnalysis: null,
          lastScenario: null,
          reportDraft: null,
          selectedLevers: [],
          resilienceIndex: 45,
          diagnosticPriorities: ["Risque inondation (ruissellement)"],
          criticalInfrastructures: [],
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          projects: { ...state.projects, [id]: newProject },
          currentProjectId: id
        }));
        return id;
      },
      setCurrentProject: (id) => set({ currentProjectId: id }),
      deleteProject: (id) => {
        if (auth && auth.currentUser) {
          deleteDoc(doc(db, 'projects', id)).catch((err) => {
            console.error("Error deleting project in Firestore:", err);
          });
        }
        set((state) => {
          const newProjects = { ...state.projects };
          delete newProjects[id];
          const remainingIds = Object.keys(newProjects);
          return {
            projects: newProjects,
            currentProjectId: state.currentProjectId === id ? (remainingIds[0] || null) : state.currentProjectId
          };
        });
      },
      updateCurrentProject: (updater) => set((state) => {
        if (!state.currentProjectId || !state.projects[state.currentProjectId]) return state;
        const currentProject = state.projects[state.currentProjectId];
        const updates = updater(currentProject);
        return {
          projects: {
            ...state.projects,
            [state.currentProjectId]: { ...currentProject, ...updates }
          }
        };
      }),

      // Compatibility getters/setters
      get messages() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.messages || [] : [];
      },
      setMessages: (updater) => {
        const state = get();
        if (!state.currentProjectId) return;
        const currentMsgs = state.projects[state.currentProjectId].messages;
        const newMsgs = typeof updater === 'function' ? updater(currentMsgs) : updater;
        state.updateCurrentProject(() => ({ messages: newMsgs }));
      },
      get activeZone() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.activeZone || null : null;
      },
      setActiveZone: (zone) => {
        const state = get();
        if (zone) {
          const updatedZones = Array.from(new Set([zone, ...(state.zones || [])]));
          set({ zones: updatedZones });
        }
        if (state.currentProjectId && state.projects[state.currentProjectId]) {
          state.updateCurrentProject(() => ({ activeZone: zone }));
        } else {
          const firstKey = Object.keys(state.projects)[0];
          if (firstKey) {
            state.setCurrentProject(firstKey);
            set((s) => ({
              projects: {
                ...s.projects,
                [firstKey]: { ...s.projects[firstKey], activeZone: zone }
              }
            }));
          } else {
            const id = state.createProject(zone || "Étude Territoire", zone);
            state.setCurrentProject(id);
          }
        }
      },
      get lastAnalysis() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.lastAnalysis || null : null;
      },
      setLastAnalysis: (analysis) => get().updateCurrentProject(() => ({ lastAnalysis: analysis })),
      get lastScenario() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.lastScenario || null : null;
      },
      setLastScenario: (scenario) => get().updateCurrentProject(() => ({ lastScenario: scenario })),
      get reportDraft() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.reportDraft || null : null;
      },
      get selectedLevers() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.selectedLevers || [] : [];
      },
      setSelectedLevers: (levers) => get().updateCurrentProject(() => ({ selectedLevers: levers })),
      get diagnosticPriorities() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.diagnosticPriorities || ["Risque inondation (ruissellement)"] : ["Risque inondation (ruissellement)"];
      },
      setDiagnosticPriorities: (priorities) => get().updateCurrentProject(() => ({ diagnosticPriorities: priorities })),
      get criticalInfrastructures() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.criticalInfrastructures || [] : [];
      },
      setCriticalInfrastructures: (infras) => get().updateCurrentProject(() => ({ criticalInfrastructures: infras })),
      get infrastructureStats() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.infrastructureStats || null : null;
      },
      setInfrastructureStats: (stats) => get().updateCurrentProject(() => ({ infrastructureStats: stats })),
      get resilienceIndex() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.resilienceIndex || 45 : 45;
      },
      setResilienceIndex: (index) => get().updateCurrentProject(() => ({ resilienceIndex: index })),

      // Notification System
      notifications: [
        {
          id: "notif-tokyo-threshold",
          title: "Seuil critique dépassé : Tokyo (Indice 66/100)",
          message: "L'indice d'exposition aux inondations à Tokyo atteint 66/100. 15 infrastructures majeures identifiées (hôpitaux, gares, casernes) sont sous surveillance.",
          type: "critical_threshold",
          severity: "critical",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          read: false,
          zone: "Tokyo, Japon",
          score: 66,
          link: "/project/new/map"
        },
        {
          id: "notif-sim-sponge",
          title: "Nouvelle simulation de risque prête",
          message: "La modélisation hydrodynamique Ville Éponge (désimperméabilisation et noues) a été calculée et est prête pour analyse.",
          type: "simulation_ready",
          severity: "success",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          read: false,
          link: "/project/new/scenarios"
        }
      ],
      audioNotificationEnabled: true,
      setAudioNotificationEnabled: (enabled) => set({ audioNotificationEnabled: enabled }),
      addNotification: (n) => {
        const id = n.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const timestamp = n.timestamp || new Date().toISOString();
        const read = n.read ?? false;
        const newNotif: AppNotification = { ...n, id, timestamp, read };

        if (get().audioNotificationEnabled && !read) {
          playNotificationChime();
        }

        set((state) => {
          const exists = state.notifications.some(
            (item) => item.title === n.title && Math.abs(new Date(item.timestamp).getTime() - new Date(timestamp).getTime()) < 5000
          );
          if (exists) return state;

          return {
            notifications: [newNotif, ...state.notifications].slice(0, 40)
          };
        });
      },
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Sovereign Storage & RGPD Implementation
      storageMode: 'hybrid',
      setStorageMode: (mode) => set({ storageMode: mode }),

      exportTerritorialArchive: () => {
        try {
          const state = get();
          const archive = {
            format: "floodatlas-territorial-archive",
            version: "1.0",
            exportedAt: new Date().toISOString(),
            gdprCompliance: {
              controller: "Utilisateur souverain",
              legalBasis: "Article 20 RGPD (Droit à la portabilité)",
              confidentiality: "Données territoriales et simulations privées"
            },
            profile: {
              role: state.role,
              language: state.language,
              zones: state.zones,
            },
            projects: state.projects,
            notifications: state.notifications
          };

          const jsonString = JSON.stringify(archive, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          const dateStr = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `floodatlas-archive-${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Error exporting territorial archive:", err);
        }
      },

      importTerritorialArchive: (jsonContent: string) => {
        try {
          const data = JSON.parse(jsonContent);
          if (!data || typeof data !== "object") return false;
          
          const importedProjects = data.projects;
          if (importedProjects && typeof importedProjects === "object") {
            set((state) => {
              const merged = { ...state.projects, ...importedProjects };
              const projectIds = Object.keys(merged);
              return {
                projects: merged,
                currentProjectId: projectIds[0] || state.currentProjectId,
                zones: Array.from(new Set([...(state.zones || []), ...(data.profile?.zones || [])]))
              };
            });
            return true;
          }
          return false;
        } catch (err) {
          console.error("Error importing archive:", err);
          return false;
        }
      },

      purgeAllUserData: async () => {
        const state = get();
        // 1. Delete from Firestore if user is authenticated
        if (auth && auth.currentUser) {
          try {
            const projectIds = Object.keys(state.projects);
            for (const pid of projectIds) {
              await deleteDoc(doc(db, "projects", pid)).catch(() => {});
            }
            await deleteDoc(doc(db, "users", auth.currentUser.uid)).catch(() => {});
          } catch (e) {
            console.warn("Could not delete from Firestore:", e);
          }
        }

        // 2. Clear state in store
        set({
          projects: {},
          currentProjectId: null,
          zones: [],
          notifications: []
        });

        // 3. Clear local storage
        try {
          localStorage.removeItem("agent-storage-v2");
        } catch (e) {}
      }
    }),
    {
      name: 'agent-storage-v2',
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        role: state.role,
        zones: state.zones,
        language: state.language,
        notifications: state.notifications,
        audioNotificationEnabled: state.audioNotificationEnabled,
        storageMode: state.storageMode
      }),
    }
  )
);

function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  } catch (e) {
    // Ignore if audio permissions not yet granted
  }
}
