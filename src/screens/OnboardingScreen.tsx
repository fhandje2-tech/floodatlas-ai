import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Building2, MapPin, Briefcase, FileText, ChevronRight, LogOut, AlertCircle, FileBarChart, Waves } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAgentStore } from '../stores/agentStore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

const ROLES = [
  { id: 'collectivite', label: 'Collectivité', icon: Building2 },
  { id: 'amenageur', label: 'Aménageur', icon: Target },
  { id: 'bureau', label: 'Bureau d\'études', icon: FileBarChart },
  { id: 'risques', label: 'Gestionnaire de risques', icon: Waves }
];

export function OnboardingScreen({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [projectName, setProjectName] = useState('');
  const [zone, setZone] = useState('');
  const [role, setRole] = useState('collectivite');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const createProject = useAgentStore((state) => state.createProject);
  const setGlobalRole = useAgentStore((state) => state.setRole);

  useEffect(() => {
    const activeLang = useAgentStore.getState().language || localStorage.getItem("sponge_city_lang") || "fr";
    if (activeLang && i18n.language !== activeLang) {
      i18n.changeLanguage(activeLang);
    }
    document.documentElement.lang = activeLang;
    document.documentElement.dir = activeLang === "ar" ? "rtl" : "ltr";
  }, [i18n]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setErrorMessage("Échec de la connexion avec Google. Veuillez réessayer.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleZoneSelect = (newZone: string) => {
    setZone(newZone);
    if (!projectName.trim() && newZone.trim()) {
      const city = newZone.split(",")[0].trim();
      setProjectName(`Résilience & Ville Éponge - ${city}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !zone.trim()) return;
    setErrorMessage(null);
    
    // Require authentication
    if (!user) {
      await handleGoogleSignIn();
      if (!auth.currentUser) return;
    }

    setIsSubmitting(true);
    let createdProjectId: string | null = null;

    try {
      // 1. Always initialize local project state first
      setGlobalRole(role);
      const projectId = createProject(projectName.trim(), zone.trim(), i18n.language, context.trim());
      createdProjectId = projectId;
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 2. Safely sync or update user profile
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          const currentLang = i18n.language || useAgentStore.getState().language || "fr";
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email || "",
              role: role,
              language: currentLang,
              name: currentUser.displayName || "",
              onboardingComplete: true,
              createdAt: serverTimestamp()
            });
          } else {
            await setDoc(userRef, {
              role: role,
              language: currentLang,
              onboardingComplete: true,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (uErr) {
          console.warn("User profile sync warning (non-fatal):", uErr);
        }

        // 3. Persist project in Firestore
        try {
          const currentLang = i18n.language || useAgentStore.getState().language || "fr";
          await setDoc(doc(db, 'projects', projectId), {
            ownerId: currentUser.uid,
            name: projectName.trim(),
            zone: zone.trim(),
            role: role,
            language: currentLang,
            context: context.trim() || "",
            diagnosticPriorities: ["Risque inondation (ruissellement)"],
            criticalInfrastructures: "[]",
            selectedLevers: [],
            resilienceIndex: 45,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (projErr) {
          console.error("Firestore project creation notice:", projErr);
          // Log structured error according to Firebase skill requirements
          try {
            handleFirestoreError(projErr, OperationType.CREATE, `projects/${projectId}`);
          } catch (e) {
            // Continues to fallback navigation below
          }
        }
      }
      
      // Proceed seamlessly to assistant workspace
      if (onComplete) {
        onComplete();
      } else {
        navigate(`/project/${projectId}/assistant`);
      }
    } catch (error: any) {
      console.error("Error in project submission workflow:", error);
      setIsSubmitting(false);

      // If local creation succeeded, don't trap the user
      if (createdProjectId) {
        if (onComplete) {
          onComplete();
        } else {
          navigate(`/project/${createdProjectId}/assistant`);
        }
      } else {
        setErrorMessage("Une erreur est survenue lors de la création du projet. Veuillez vérifier votre saisie.");
      }
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl p-8"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-text-1 mb-2">Nouveau Projet</h1>
          <p className="text-text-2 text-sm">Configurez un nouvel espace de travail pour l'analyse de résilience territoriale.</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/30 rounded-lg flex items-start space-x-3 text-brand-red text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {!user ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-text-1 mb-4">Authentification requise pour sauvegarder vos projets</h2>
            <button 
              onClick={handleGoogleSignIn}
              className="mx-auto flex items-center justify-center space-x-3 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continuer avec Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">
                Nom du projet <span className="text-brand-red">*</span>
              </label>
              <input 
                type="text" 
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ex: Plan de prévention des crues 2026"
                className="w-full bg-void border border-border rounded-lg px-4 py-3 text-text-1 focus:outline-none focus:border-brand-teal transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">
                Territoire / Zone <span className="text-brand-red">*</span>
              </label>
              <AddressAutocomplete
                value={zone}
                onChange={handleZoneSelect}
                onSelect={handleZoneSelect}
                placeholder="Rechercher une ville, métropole ou adresse..."
                className="w-full"
                inputClassName="w-full bg-void border border-border rounded-lg pl-12 pr-10 py-3 text-text-1 focus:outline-none focus:border-brand-teal transition-colors"
                icon={<MapPin className="w-5 h-5 text-text-3" />}
                required
              />
              <p className="text-[11px] text-text-3 mt-1.5">
                Tapez pour afficher les suggestions automatiques (OpenStreetMap) ou saisissez librement votre zone.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">
                Votre Profil / Rôle
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
                      role === r.id ? 'bg-brand-teal/10 border-brand-teal' : 'bg-void border-border hover:border-text-3'
                    }`}
                  >
                    <r.icon className={`w-5 h-5 ${role === r.id ? 'text-brand-teal' : 'text-text-3'}`} />
                    <span className={`text-sm font-medium ${role === r.id ? 'text-brand-teal' : 'text-text-2'}`}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">
                Contexte (Optionnel)
              </label>
              <textarea 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Quels sont les objectifs principaux de ce projet ?"
                className="w-full h-24 bg-void border border-border rounded-lg px-4 py-3 text-text-1 focus:outline-none focus:border-brand-teal transition-colors resize-none"
              />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-border">
              <div className="flex items-center space-x-2 text-sm text-text-3">
                <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal font-bold uppercase">
                  {user.email?.[0] || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-text-2 text-xs leading-tight">{user.email}</span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-[10px] text-text-3 hover:text-brand-red text-left transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="w-2.5 h-2.5 inline mr-0.5" />
                    <span>Changer de compte</span>
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || !projectName.trim() || !zone.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-brand-teal text-void font-bold rounded-lg hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isSubmitting ? 'Création...' : 'Démarrer le projet'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
