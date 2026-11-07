import React, { useState, useEffect } from "react";
import { 
  User, 
  Palette, 
  Globe, 
  Sliders, 
  ShieldCheck, 
  LogOut, 
  Check, 
  Sun, 
  Moon, 
  Monitor, 
  Save, 
  Trash2,
  Building,
  BellRing,
  ArrowLeft,
  X,
  GraduationCap,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Award,
  UserCheck,
  Building2,
  Compass,
  CheckCircle2,
  HardDrive,
  Cloud,
  Database,
  Upload,
  Lock,
  Sparkles,
  AlertTriangle,
  Zap,
  Eye
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAgentStore } from "../stores/agentStore";
import { SUPPORTED_LANGUAGES } from "../i18n/config";
import { getSavedTheme, applyTheme, ThemeMode } from "../lib/theme";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function Settings() {
  const { t, i18n } = useTranslation(["settings", "common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    language, 
    setLanguage, 
    role, 
    setRole,
    storageMode,
    setStorageMode,
    exportTerritorialArchive,
    importTerritorialArchive,
    purgeAllUserData,
    projects
  } = useAgentStore();

  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "privacy" | "quality" | "language" | "system" | "academic">(
    (location.state as any)?.defaultTab || "profile"
  );
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Profile fields
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || "");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [selectedRole, setSelectedRole] = useState(role || "Collectivité");
  const [organization, setOrganization] = useState("");
  const [territoryZone, setTerritoryZone] = useState("");
  
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(getSavedTheme());

  // Units & notifications
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Status feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user profile from Firestore on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (auth.currentUser) {
        setEmail(auth.currentUser.email || "");
        if (auth.currentUser.displayName && !displayName) {
          setDisplayName(auth.currentUser.displayName);
        }
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.name) setDisplayName(data.name);
            if (data.role) {
              setSelectedRole(data.role);
              setRole(data.role);
            }
            if (data.organization) setOrganization(data.organization);
            if (data.activeZone) setTerritoryZone(data.activeZone);
            if (data.unitSystem) setUnitSystem(data.unitSystem);
            if (data.weatherAlerts !== undefined) setWeatherAlerts(data.weatherAlerts);
          }
        } catch (e) {
          console.warn("Could not load user profile:", e);
        }
      }
    };
    loadProfile();
  }, [setRole]);

  // Handle Theme Change
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Handle Language Change
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      setRole(selectedRole);
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, {
          name: displayName.trim(),
          role: selectedRole,
          organization: organization.trim(),
          activeZone: territoryZone.trim(),
          unitSystem,
          weatherAlerts,
          weeklyDigest,
          language: i18n.language || language || "fr",
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Clear local cache
  const handleClearLocalCache = () => {
    if (window.confirm("Réinitialiser le cache local de l'application ?")) {
      try {
        localStorage.removeItem("agent-storage-v2");
        window.location.reload();
      } catch (e) {}
    }
  };

  // Close or go back to previous screen
  const handleCloseOrBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  // Handle Archive File Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importTerritorialArchive(content);
      if (success) {
        setImportFeedback("Archive territoriale restaurée avec succès !");
        setTimeout(() => setImportFeedback(null), 4000);
      } else {
        setImportFeedback("Format non reconnu : Fichier JSON d'archive invalide.");
        setTimeout(() => setImportFeedback(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle Purge All User Data (GDPR Right to Erasure)
  const handlePurgeAllData = async () => {
    const confirmed = window.confirm(
      "CONFIRMATION RGPD (Article 17 - Droit à l'effacement) :\n\nCette action supprimera irréversiblement l'intégralité de vos projets, simulations et calques de votre espace cloud ainsi que du stockage local de ce navigateur.\n\nConfirmez-vous la purge totale ?"
    );
    if (!confirmed) return;
    setIsPurging(true);
    await purgeAllUserData();
    setIsPurging(false);
    navigate("/dashboard");
    window.location.reload();
  };

  const tabs = [
    { id: "profile", label: t("tabs.profile", "Profil"), icon: User },
    { id: "appearance", label: "Apparence & Contrastes", icon: Palette },
    { id: "privacy", label: "Souveraineté & RGPD", icon: ShieldCheck },
    { id: "quality", label: "Qualité, Langues & Sources", icon: CheckCircle2 },
    { id: "language", label: "Langue & Unités", icon: Globe },
    { id: "system", label: "Préférences Système", icon: Sliders },
    { id: "academic", label: "Thèse MBA & Recherche", icon: GraduationCap },
  ] as const;

  const userInitial = displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex h-full w-full bg-void font-body text-text-1">
      {/* Settings Navigation Sidebar */}
      <div className="w-64 bg-surface border-r border-border shrink-0 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-border/60">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="flex items-center space-x-1.5 text-[12px] font-semibold text-text-2 hover:text-white px-2.5 py-1.5 rounded-lg bg-elevated/60 hover:bg-elevated transition-colors border border-border"
              title="Retourner à l'écran précédent"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-blue" />
              <span>Retour</span>
            </button>
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-elevated transition-colors"
              title="Fermer les paramètres"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="font-display font-semibold text-[17px] tracking-tight mt-3">
            {t("title", "Paramètres")}
          </h2>
          <p className="text-[12px] text-text-3 mt-0.5">Espace de travail territorial</p>
        </div>
        
        <div className="flex-1 p-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-blue/15 text-brand-blue border border-brand-blue/30 shadow-sm" 
                  : "text-text-2 hover:bg-elevated hover:text-text-1 border border-transparent"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-brand-blue" : "text-text-3"}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-border/80">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center font-bold text-sm text-brand-blue">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-text-1 truncate">{displayName || "Utilisateur"}</p>
              <p className="text-[11px] text-text-3 truncate">{email || "En ligne"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-medium text-text-3 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
          
          {/* Top Return Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="flex items-center space-x-2 text-[13px] font-medium text-text-2 hover:text-text-1 group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-brand-blue group-hover:-translate-x-0.5 transition-transform" />
              <span>Retourner à l'espace de travail</span>
            </button>
            <button
              type="button"
              onClick={handleCloseOrBack}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-2 hover:text-text-1 hover:bg-elevated transition-colors"
            >
              <X className="w-3.5 h-3.5 text-text-3" />
              <span>Fermer</span>
            </button>
          </div>
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h3 className="text-xl font-display font-semibold mb-1">Informations du Profil</h3>
                <p className="text-[13px] text-text-3">Gérez vos identifiants, votre rôle et votre collectivité de rattachement.</p>
              </div>

              {/* Avatar Section */}
              <div className="p-5 bg-surface border border-border rounded-2xl flex items-center space-x-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue/30 to-brand-teal/20 border border-brand-blue/40 flex items-center justify-center font-bold text-2xl text-brand-blue shadow-inner">
                  {userInitial}
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-text-1">{displayName || "Mon Compte"}</h4>
                  <p className="text-[12px] text-text-3">{email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">
                    {selectedRole}
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Nom complet ou Titre" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="ex. Fabien Handje" 
                  />
                  <Input 
                    label="Adresse email" 
                    value={email} 
                    disabled 
                    className="opacity-70 cursor-not-allowed" 
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-text-2 mb-1.5">
                    Rôle & Profil d'expertise
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-void border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-text-1 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="Collectivité">Collectivité / Élu territorial</option>
                    <option value="Aménageur">Aménageur urbain / Promoteur</option>
                    <option value="Bureau d'études">Bureau d'études / Ingénieur hydraulique</option>
                    <option value="Gestionnaire de risques">Gestionnaire de risques & Gemapi</option>
                    <option value="Chercheur / Expert">Chercheur / Expert climat</option>
                    <option value="Autre">Autre professionnel</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Organisation ou Commune" 
                    value={organization} 
                    onChange={(e) => setOrganization(e.target.value)} 
                    placeholder="ex. Ville de Vincennes" 
                  />
                  <Input 
                    label="Bassin versant / Territoire principal" 
                    value={territoryZone} 
                    onChange={(e) => setTerritoryZone(e.target.value)} 
                    placeholder="ex. Bassin Marne-Amont" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {savedSuccess && (
                    <span className="text-[12px] font-medium text-brand-teal flex items-center">
                      <Check className="w-4 h-4 mr-1.5" /> Profil enregistré avec succès
                    </span>
                  )}
                </div>
                <Button type="submit" disabled={isSaving} className="shadow-sm">
                  <Save className="w-4 h-4 mr-1.5" />
                  {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          )}

          {/* APPEARANCE & CONTRAST TAB */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-display font-semibold mb-1 text-text-1">Apparence & Modalités de Contraste</h3>
                <p className="text-[13px] text-text-3">
                  Personnalisez le rendu visuel selon votre environnement de travail (bureau, nocturne ou terrain ensoleillé) et vos besoins d'accessibilité (normes RGAA / WCAG AAA).
                </p>
              </div>

              {/* Standard Themes */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-semibold text-text-1">Palettes Standard de Travail</label>
                  <span className="text-[11px] text-text-3 font-mono">Bureautique & Écrans Calibrés</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === "dark"
                        ? "bg-brand-blue/15 border-brand-blue ring-1 ring-brand-blue/50 text-white shadow-sm"
                        : "bg-void border-border text-text-2 hover:bg-elevated hover:text-text-1"
                    }`}
                  >
                    <Moon className="w-5 h-5 mb-2 text-brand-blue" />
                    <span className="text-[13px] font-semibold">Sombre Moderne</span>
                    <span className="text-[10px] text-text-3 mt-0.5">Palette nuit & repos oculaire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === "light"
                        ? "bg-brand-blue/15 border-brand-blue ring-1 ring-brand-blue/50 text-brand-blue shadow-sm"
                        : "bg-void border-border text-text-2 hover:bg-elevated hover:text-text-1"
                    }`}
                  >
                    <Sun className="w-5 h-5 mb-2 text-brand-amber" />
                    <span className="text-[13px] font-semibold">Clair Épuré</span>
                    <span className="text-[10px] text-text-3 mt-0.5">Idéal en bureautique de jour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange("system")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === "system"
                        ? "bg-brand-blue/15 border-brand-blue ring-1 ring-brand-blue/50 text-white shadow-sm"
                        : "bg-void border-border text-text-2 hover:bg-elevated hover:text-text-1"
                    }`}
                  >
                    <Monitor className="w-5 h-5 mb-2 text-brand-teal" />
                    <span className="text-[13px] font-semibold">Automatique Système</span>
                    <span className="text-[10px] text-text-3 mt-0.5">Suit les préférences de l'OS</span>
                  </button>
                </div>
              </div>

              {/* High Contrast & Field Accessibility Options */}
              <div className="p-6 bg-surface border border-brand-teal/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-brand-teal" />
                    <label className="block text-[13px] font-semibold text-text-1">
                      Modalités de Contraste Renforcé & Vision Terrain
                    </label>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                    WCAG AAA &bull; RGAA
                  </span>
                </div>
                <p className="text-[12px] text-text-3">
                  Ces modes renforcent l'épaisseur des bordures, fixent un ratio de contraste supérieur à 7:1 et augmentent la saturation des aléas d'inondation pour une lisibilité sans équivoque.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("high-contrast")}
                    className={`flex items-start space-x-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      theme === "high-contrast"
                        ? "bg-black border-white ring-2 ring-white text-white shadow-lg"
                        : "bg-void border-border text-text-2 hover:bg-elevated hover:text-white"
                    }`}
                  >
                    <div className="p-2.5 rounded-lg bg-black border border-white text-white shrink-0 font-bold">
                      ⚡
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[13px] font-bold text-white">Contraste Élevé Sombre</span>
                        {theme === "high-contrast" && <Check className="w-4 h-4 text-brand-teal" />}
                      </div>
                      <p className="text-[11px] text-text-3 mt-0.5">
                        Fond noir absolu (#000), bordures blanches franches 2px, suppression des dégradés mous. Conforme accessibilité malvoyance.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange("high-contrast-light")}
                    className={`flex items-start space-x-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      theme === "high-contrast-light"
                        ? "bg-white border-black ring-2 ring-black text-black shadow-lg"
                        : "bg-void border-border text-text-2 hover:bg-elevated hover:text-white"
                    }`}
                  >
                    <div className="p-2.5 rounded-lg bg-white border border-black text-black shrink-0 font-bold">
                      🔆
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[13px] font-bold text-text-1">Contraste Élevé Clair (Plein Soleil)</span>
                        {theme === "high-contrast-light" && <Check className="w-4 h-4 text-brand-blue" />}
                      </div>
                      <p className="text-[11px] text-text-3 mt-0.5">
                        Fond blanc pur, contrastes ultra-nets sans reflets. Idéal sur tablette lors de tournées d'inspection de digues et voiries.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Theme Live Preview Card */}
              <div className="p-4 bg-void border border-border rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <Eye className="w-4 h-4 text-brand-teal" />
                  <span className="text-text-2">
                    Mode actif : <strong>{theme}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-red/20 text-brand-red border border-brand-red/40">
                    Aléa Fort
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-teal/20 text-brand-teal border border-brand-teal/40">
                    Résilience 74%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SOUVERAINETÉ & RGPD TAB */}
          {activeTab === "privacy" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                    Conformité Règlementaire
                  </span>
                  <span className="text-[10px] font-mono text-text-3">Règlement Européen (UE) 2016/679 &bull; RGPD</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-text-1">
                  Souveraineté des Données & Transparence RGPD
                </h3>
                <p className="text-[13px] text-text-3">
                  Garanties de confidentialité, cloisonnement des territoires d'analyse et contrôle souverain de vos simulations.
                </p>
              </div>

              {/* Hidden file input for archive restore */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".json,application/json" 
                className="hidden" 
              />

              {/* Storage Strategy Card */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-text-1 flex items-center gap-2">
                    <Database className="w-4 h-4 text-brand-blue" />
                    Doctrine de Stockage de Vos Données
                  </h4>
                  <span className="text-[11px] text-text-3 font-mono">Contrôle Exclusif</span>
                </div>
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  FloodAtlas AI étant une plateforme open-source, vous décidez souverainement de l'emplacement de vos données de modélisation hydraulique et de vos calques urbains :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStorageMode('hybrid')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      storageMode === 'hybrid'
                        ? "bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue/50 text-text-1"
                        : "bg-void border-border text-text-2 hover:bg-elevated"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-brand-blue/15 text-brand-blue">
                        <Cloud className="w-4 h-4" />
                      </div>
                      {storageMode === 'hybrid' && <Check className="w-4 h-4 text-brand-blue" />}
                    </div>
                    <div className="font-semibold text-[13px] text-text-1">Espace Cloud Cloisonné (Recommandé)</div>
                    <p className="text-[11px] text-text-3 mt-1 leading-relaxed">
                      Données hébergées dans l'Union Européenne (<code className="text-brand-blue">europe-west1</code>), isolées par compte utilisateur (ABAC) avec chiffrement AES-256. Accès multi-postes sécurisé.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorageMode('local_only')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      storageMode === 'local_only'
                        ? "bg-brand-teal/10 border-brand-teal ring-1 ring-brand-teal/50 text-text-1"
                        : "bg-void border-border text-text-2 hover:bg-elevated"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-brand-teal/15 text-brand-teal">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      {storageMode === 'local_only' && <Check className="w-4 h-4 text-brand-teal" />}
                    </div>
                    <div className="font-semibold text-[13px] text-text-1">Espace 100% Local (Local-First)</div>
                    <p className="text-[11px] text-text-3 mt-1 leading-relaxed">
                      Aucune donnée ne transite ni n'est enregistrée sur un serveur distant. Tout reste strictement confiné dans la mémoire chiffrée de votre navigateur. Idéal pour projets classifiés ou sensibles.
                    </p>
                  </button>
                </div>
              </div>

              {/* Data Portability (Article 20 RGPD) */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-text-1 flex items-center gap-2">
                    <Download className="w-4 h-4 text-brand-teal" />
                    Droit à la Portabilité des Données (Article 20 RGPD)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-void text-text-3 border border-border">
                    Format Ouvert .JSON
                  </span>
                </div>
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  Exportez l'intégralité de vos projets territoriaux, calculs de débits de crue, scénarios Ville Éponge et calques SIG pour les exploiter dans vos outils tiers ou les sauvegarder sur vos serveurs internes.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={exportTerritorialArchive}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exporter l'Archive Territoriale (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-void hover:bg-elevated border border-border text-text-1 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-brand-teal" />
                    <span>Restaurer une Archive Existante</span>
                  </button>
                </div>

                {importFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    importFeedback.includes("succès") 
                      ? "bg-brand-teal/10 border-brand-teal/30 text-brand-teal" 
                      : "bg-brand-red/10 border-brand-red/30 text-brand-red"
                  }`}>
                    {importFeedback.includes("succès") ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{importFeedback}</span>
                  </div>
                )}
              </div>

              {/* GDPR Key Commitments */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <h4 className="text-[14px] font-semibold text-text-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-blue" />
                  Engagements Clés de la Charte de Confidentialité
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1">
                    <div className="font-semibold text-text-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-teal" />
                      Zéro Revente &bull; Zéro Profilage
                    </div>
                    <p className="text-[11px] text-text-3 leading-relaxed">
                      Aucune donnée territoriale, adresse ou simulation n'est transmise à des régies publicitaires ou des courtiers de données.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1">
                    <div className="font-semibold text-text-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-brand-blue" />
                      Hébergement Cloud Souverain (UE)
                    </div>
                    <p className="text-[11px] text-text-3 leading-relaxed">
                      Les serveurs de base de données sont situés en Europe (<code className="text-brand-blue">europe-west1</code>), sous juridiction protectrice RGPD.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1">
                    <div className="font-semibold text-text-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                      Cloisonnement Strict par UID (ABAC)
                    </div>
                    <p className="text-[11px] text-text-3 leading-relaxed">
                      Vos projets ne sont lisibles et modifiables que par vous-même via des règles de sécurité Firestore mathématiquement étanches.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1">
                    <div className="font-semibold text-text-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-amber" />
                      Transparence Open-Source
                    </div>
                    <p className="text-[11px] text-text-3 leading-relaxed">
                      Le code de l'application est public et auditable, garantissant l'absence de traceurs ou de portes dérobées.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right to Erasure / Purge (Article 17 RGPD) */}
              <div className="p-6 bg-brand-red/5 border border-brand-red/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-brand-red flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Droit à l'Effacement &bull; Purge Intégrale (Article 17 RGPD)
                  </h4>
                  <span className="text-[10px] font-mono text-brand-red uppercase font-bold">Droit à l'oubli</span>
                </div>
                <p className="text-[12px] text-text-2 leading-relaxed">
                  Vous pouvez à tout instant supprimer irréversiblement l'ensemble de vos projets territoriaux, calculs, messages et profils enregistrés dans le cloud et dans votre navigateur.
                </p>
                <div className="pt-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handlePurgeAllData} 
                    disabled={isPurging}
                    className="bg-brand-red hover:bg-brand-red/90 text-white border-0 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    {isPurging ? "Purge en cours..." : "Purger définitivement toutes mes données (Effacement RGPD)"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* QUALITÉ, LANGUES & SOURCES TAB */}
          {activeTab === "quality" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                    Assurance Qualité & Rigueur
                  </span>
                  <span className="text-[10px] font-mono text-text-3">Traçabilité & Certifications Scientifiques</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-text-1">
                  Garanties Scientifiques, Multilinguisme & Sources
                </h3>
                <p className="text-[13px] text-text-3">
                  Découvrez comment FloodAtlas AI garantit la maintenance linguistique, l'authenticité des sources et l'excellence des livrables opérationnels.
                </p>
              </div>

              {/* Pillar 1: Multilingual Maintenance */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-text-1 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-blue" />
                    1. Garantie de Maintenance & Support Multilingue
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue border border-brand-blue/30 font-bold">
                    5 Langues Actives
                  </span>
                </div>
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  FloodAtlas AI est conçu pour une collaboration internationale entre collectivités et bureaux d'études transfrontaliers :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1">
                    <span className="font-semibold text-text-1 block">Dictionnaires Métier i18n</span>
                    <p className="text-[11px] text-text-3">
                      Vocabulaire technique de l'hydraulique et de la résilience validé en Français, Anglais, Allemand, Espagnol et Italien.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1">
                    <span className="font-semibold text-text-1 block">Prompts IA Contextualisés</span>
                    <p className="text-[11px] text-text-3">
                      Atlas IA et le générateur de rapports adaptent dynamiquement leur phraséologie et leurs unités au pays de l'utilisateur.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1">
                    <span className="font-semibold text-text-1 block">Fallbacks & Zéro Coupure</span>
                    <p className="text-[11px] text-text-3">
                      En cas de quota temporaire ou de déconnexion, des modèles de référence locaux bilingues prennent le relais sans bloquer l'élu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Source Credibility & Open Data */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-text-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-teal" />
                    2. Crédibilité & Traçabilité des Données Sources
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-teal/15 text-brand-teal border border-brand-teal/30 font-bold">
                    Données Ouvertes & Certifiées
                  </span>
                </div>
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  Aucun chiffre n'est inventé : toutes les analyses croisent des sources géospatiales et physiques souveraines :
                </p>

                <div className="space-y-2.5 text-xs">
                  {[
                    {
                      source: "OpenStreetMap (OSM) via Overpass API",
                      role: "Cartographie et détection des infrastructures critiques (hôpitaux, écoles, postes électriques).",
                      method: "Recherche multilingue (ex: kanji à Tokyo, OSM tags officiels) et géodésie Haversine précise."
                    },
                    {
                      source: "Modèle Numérique de Terrain (MNT Copernicus / IGN / SRTM)",
                      role: "Détermination des bassins versants, lignes de crête, thalwegs et pentes d'accumulation.",
                      method: "Calcul des vitesses d'écoulement et zones d'entonnement par gravité."
                    },
                    {
                      source: "Courbes IDF Météo-France & NOAA (Formule de Montana)",
                      role: "Calibration des événements pluvieux de référence (Q10, Q50, Q100).",
                      method: "Méthode rationnelle pondérée (Q = C × I × A) et coefficient d'imperméabilisation des sols."
                    },
                    {
                      source: "Référentiels CEREMA & Caisse Centrale de Réassurance (CCR)",
                      role: "Barème économique des dommages évités aux personnes, habitations et activités.",
                      method: "Coûts de sinistre standardisés (350 € à 600 € / m² inondé) actualisés sur 30 ans."
                    }
                  ].map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-void border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-text-1 text-[12px]">{s.source}</span>
                        <p className="text-[11px] text-text-3 mt-0.5">{s.role}</p>
                      </div>
                      <span className="text-[10px] font-mono text-brand-teal shrink-0 bg-brand-teal/10 px-2 py-1 rounded border border-brand-teal/20">
                        {s.method}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 3: Deliverable Quality & Academic Rigor */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-text-1 flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-amber" />
                    3. Qualité & Rigueur des Livrables Décisionnels
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-amber/15 text-brand-amber border border-brand-amber/30 font-bold">
                    Normes PCAET & PAPI
                  </span>
                </div>
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  Les dossiers techniques exportables respectent la structure réglementaire attendue lors des délibérations de conseils municipaux, enquêtes publiques ou candidatures aux fonds d'adaptation climat :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1.5">
                    <span className="font-semibold text-text-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-blue" />
                      Analyse Coûts-Bénéfices (ACB) Normée
                    </span>
                    <p className="text-[11px] text-text-3 leading-relaxed">
                      Chaque scénario fournit le Ratio Bénéfice / Coût (RBC) et compare le CAPEX des travaux Ville Éponge aux coûts de sinistralité évités sur 30 ans.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-void border border-border space-y-1.5">
                    <span className="font-semibold text-text-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-teal" />
                      Fondement Scientifique MBA De Vinci
                    </span>
                    <p className="text-[11px] text-text-3 leading-relaxed">
                      Basé sur la grille d'évaluation des 6 dimensions de résilience de la thèse de Fabien Aimé HANDJE POUNJIEU (mission gaea21, dir. Laurent JULVEZ).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LANGUAGE TAB */}
          {activeTab === "language" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-display font-semibold mb-1">Langue & Région</h3>
                <p className="text-[13px] text-text-3">La langue choisie est immédiatement active, sauvegardée dans votre profil et persistante à chaque reconnexion.</p>
              </div>

              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <label className="block text-[13px] font-semibold text-text-1">Langue de l'interface</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isActive = (i18n.language || language) === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                          isActive
                            ? "bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue/50 text-text-1"
                            : "bg-void border-border text-text-2 hover:bg-elevated hover:text-text-1"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <p className="text-[14px] font-semibold">{lang.label}</p>
                            <p className="text-[11px] text-text-3 uppercase">{lang.code}</p>
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex items-center space-x-1 text-brand-blue">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-3">
                  <span>Persistance automatique : <strong>Activée</strong></span>
                  <span className="text-brand-teal">✓ Synchronisé cloud & local</span>
                </div>
              </div>

              {/* Units */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <label className="block text-[13px] font-semibold text-text-1">Unités de mesure</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUnitSystem("metric")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      unitSystem === "metric"
                        ? "bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue/50"
                        : "bg-void border-border text-text-2 hover:bg-elevated"
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-text-1">Système Métrique</p>
                      <p className="text-[11px] text-text-3">m², ha, mm de pluie, m³/s</p>
                    </div>
                    {unitSystem === "metric" && <Check className="w-4 h-4 text-brand-blue" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setUnitSystem("imperial")}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      unitSystem === "imperial"
                        ? "bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue/50"
                        : "bg-void border-border text-text-2 hover:bg-elevated"
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-text-1">Système Impérial</p>
                      <p className="text-[11px] text-text-3">sq ft, acres, inches, cfs</p>
                    </div>
                    {unitSystem === "imperial" && <Check className="w-4 h-4 text-brand-blue" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM & DATA TAB */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-display font-semibold mb-1">Préférences & Données</h3>
                <p className="text-[13px] text-text-3">Gérez vos alertes de vigilance et la gestion des données locales.</p>
              </div>

              {/* Notification Toggles */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <label className="block text-[13px] font-semibold text-text-1">Notifications & Vigilance</label>
                
                <div className="flex items-center justify-between py-2 border-b border-border/60">
                  <div>
                    <p className="text-[13px] font-medium text-text-1">Alertes ruissellement et précipitations intenses</p>
                    <p className="text-[11px] text-text-3">Notification lors de franchissement de seuils critiques sur vos bassins.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={weatherAlerts} 
                    onChange={(e) => setWeatherAlerts(e.target.checked)}
                    className="w-4 h-4 accent-brand-blue rounded cursor-pointer" 
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium text-text-1">Rapports d'impact hebdomadaires</p>
                    <p className="text-[11px] text-text-3">Synthèse par email des évolutions de résilience territoriale.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={weeklyDigest} 
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="w-4 h-4 accent-brand-blue rounded cursor-pointer" 
                  />
                </div>
              </div>

              {/* Cache & Security */}
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
                <label className="block text-[13px] font-semibold text-text-1">Sécurité & Cache</label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-text-1">Vider le cache local</p>
                    <p className="text-[11px] text-text-3">Recharge les modèles et cartes sans supprimer vos projets sur le serveur.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleClearLocalCache}>
                    <Trash2 className="w-3.5 h-3.5 mr-1 text-text-3" /> Vider le cache
                  </Button>
                </div>
              </div>

              {/* Starter Tier Information Card */}
              <div className="p-6 bg-gradient-to-br from-surface to-brand-teal/5 border border-brand-teal/20 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1.5 rounded-lg bg-brand-teal/15 text-brand-teal text-sm">🌿</span>
                  <h4 className="text-[14px] font-semibold text-text-1">Accès Starter Tier & Conditions d'utilisation</h4>
                </div>
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  FloodAtlas AI est déployé avec le forfait découverte <strong>Starter Tier</strong> de Google AI Studio. Vous bénéficiez d'un quota journalier gratuit pour vos analyses hydrologiques et vos scénarios.
                </p>
                <div className="p-3 bg-void/60 rounded-xl border border-border/60 text-[11.5px] text-text-3 flex items-start space-x-2">
                  <span className="text-brand-teal font-bold mt-0.5">ℹ</span>
                  <span>En cas d'atteinte du quota journalier, un message bienveillant vous en informera. Vos cartographies, couches SIG et projets restent sauvegardés et pleinement consultables à tout moment.</span>
                </div>
              </div>
            </div>
          )}

          {/* ACADEMIC RESEARCH & MBA THESIS TAB */}
          {activeTab === "academic" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                    Recherche Universitaire Appliquée
                  </span>
                  <span className="text-[10px] font-mono text-text-3">De Vinci Executive Education &bull; 2026</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-text-1">
                  Thèse Professionnelle de MBA & Cadre Scientifique
                </h3>
                <p className="text-[13px] text-text-3">
                  Origine académique, méthodologie scientifique et fondements conceptuels de FloodAtlas AI.
                </p>
              </div>

              {/* Research Header Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-blue/15 via-surface to-brand-teal/10 border border-brand-teal/30 shadow-lg space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-brand-teal">
                      MBA MANAGEMENT DES TRANSITIONS URBAINES ET DÉVELOPPEMENT DES TERRITOIRES — DE VINCI
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                      De la gestion de crise à la résilience territoriale : comment FloodAtlas AI peut-il aider les villes à anticiper, visualiser et réduire le risque de crue ?
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-xl bg-void/60 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-teal flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Auteur du mémoire
                    </span>
                    <div className="font-semibold text-white">Fabien Aimé HANDJE POUNJIEU</div>
                    <p className="text-[11px] text-text-3">Ingénieur civil &bull; Diplômé MBA</p>
                  </div>
                  <div className="p-3 rounded-xl bg-void/60 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-blue flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Cadre de mission
                    </span>
                    <div className="font-semibold text-white">gaea21 &bull; Genève</div>
                    <p className="text-[11px] text-text-3">Architecture verte & Smart Cities</p>
                  </div>
                  <div className="p-3 rounded-xl bg-void/60 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-amber flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Direction pédagogique
                    </span>
                    <div className="font-semibold text-white">Laurent JULVEZ</div>
                    <p className="text-[11px] text-text-3">Enseignant Référent &bull; De Vinci</p>
                  </div>
                </div>
              </div>

              {/* Problem statement */}
              <div className="p-5 bg-surface border border-border rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Problématique centrale & Démarche
                </h4>
                <blockquote className="p-4 rounded-xl bg-void border-l-4 border-brand-teal text-text-1 text-[13px] leading-relaxed italic">
                  &laquo; Dans quelle mesure une plateforme d'IA verticale comme FloodAtlas AI peut-elle aider les territoires urbains à sortir d'une logique de gestion de crise pour entrer dans une logique de résilience territoriale, en identifiant les paramètres de vulnérabilité, en comparant des stratégies d'adaptation fondées sur l'aménagement autant que sur l'hydraulique, et en proposant des scénarios réplicables à l'international ? &raquo;
                </blockquote>
                <p className="text-xs text-text-2 leading-relaxed">
                  Le mémoire démontre que la gestion conventionnelle des inondations, purement hydraulique et curative (digues, canalisations surdimensionnées), atteint ses limites techniques et financières face au dérèglement climatique. <strong>FloodAtlas AI</strong> matérialise l'intégration des <strong>Solutions fondées sur la Nature (SfN)</strong> et du concept de <strong>Ville Éponge</strong> dans la planification territoriale.
                </p>
              </div>

              {/* The 6 dimensions of territorial resilience */}
              <div className="p-5 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-brand-blue" />
                    Les 6 Dimensions de la Résilience Territoriale
                  </h4>
                  <span className="text-[10px] font-mono text-text-3">Référentiel Thèse Handje Pounjieu</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { num: "1", title: "Connaissance du risque par la donnée", desc: "Agrégation MNT, OSM, occupation des sols et modélisation des écoulements." },
                    { num: "2", title: "Anticipation & prévision", desc: "Simulation des scénarios de crues décennale (Q10) et centennale (Q100)." },
                    { num: "3", title: "Réduction de la vulnérabilité", desc: "Identification des infrastructures critiques (santé, éducation, énergie)." },
                    { num: "4", title: "Adaptation des formes urbaines", desc: "Modélisation de 8 leviers Ville Éponge et désimperméabilisation." },
                    { num: "5", title: "Gouvernance & concertation", desc: "Dossiers d'aide à la décision pour élus, urbanistes et citoyens." },
                    { num: "6", title: "Capacité de décision rapide", desc: "Calcul ACB (CAPEX vs dommages évités) et ratios coût-bénéfice." },
                  ].map((dim) => (
                    <div key={dim.num} className="p-3 rounded-xl bg-void border border-border flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-brand-teal/15 text-brand-teal border border-brand-teal/30 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                        {dim.num}
                      </span>
                      <div>
                        <div className="font-semibold text-text-1 text-[12px]">{dim.title}</div>
                        <div className="text-[11px] text-text-3 mt-0.5">{dim.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedded PDF Viewer & Download */}
              <div className="p-5 bg-surface border border-border rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-1 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-brand-blue" />
                      Document Intégral du Mémoire (57 pages)
                    </h4>
                    <p className="text-[11px] text-text-3 mt-0.5">
                      Consultable directement dans votre navigateur ou téléchargeable en format PDF haute résolution.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="/assets/aistudio/Memoire_Fabien_HANDJE_MTU__1___1__89edad6c.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-void border border-border hover:bg-elevated text-xs font-medium text-text-2 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Plein écran</span>
                    </a>
                    <a
                      href="/assets/aistudio/Memoire_Fabien_HANDJE_MTU__1___1__89edad6c.pdf"
                      download="Memoire_Fabien_HANDJE_FloodAtlas_AI_MBA_MTU.pdf"
                      className="px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger (PDF)</span>
                    </a>
                  </div>
                </div>

                <div className="h-[520px] w-full rounded-xl overflow-hidden border border-border bg-void">
                  <iframe
                    src="/assets/aistudio/Memoire_Fabien_HANDJE_MTU__1___1__89edad6c.pdf#toolbar=1&navpanes=0"
                    className="w-full h-full border-0"
                    title="Mémoire de MBA - FloodAtlas AI"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
