import fs from 'fs';

const content = `import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, MapIcon, Sparkles, FileBarChart, Waves, Check, Building2, MapPin, Briefcase, FileText, ChevronRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAgentStore } from '../stores/agentStore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

const ROLES = [
  { id: 'collectivite', label: 'Collectivité', icon: Building2 },
  { id: 'amenageur', label: 'Aménageur', icon: Target },
  { id: 'bureau', label: 'Bureau d\\'études', icon: FileBarChart },
  { id: 'risques', label: 'Gestionnaire de risques', icon: Waves }
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { t, i18n } = useTranslation('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [projectName, setProjectName] = useState('');
  const [zone, setZone] = useState('');
  const [role, setRole] = useState('collectivite');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createProject = useAgentStore((state) => state.createProject);
  const updateCurrentProject = useAgentStore((state) => state.updateCurrentProject);
  const setGlobalRole = useAgentStore((state) => state.setRole);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      
      // If user logs in, we might want to sync their existing projects from Firestore here.
      // For now, we will let them create a new one to proceed.
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !zone.trim()) return;
    
    // Require authentication
    if (!user) {
      await handleGoogleSignIn();
      if (!auth.currentUser) return; // if they cancelled
    }

    setIsSubmitting(true);
    try {
      // Create in local store first
      setGlobalRole(role);
      const projectId = createProject(projectName, zone, i18n.language);
      
      // Also save context in local store if we added it, but right now we don't have it in the state out-of-the-box.
      // Let's at least sync to Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        
        // Ensure user profile exists
        await setDoc(doc(db, 'users', currentUser.uid), {
          email: currentUser.email,
          role: role,
          createdAt: serverTimestamp()
        }, { merge: true });

        // Save project
        await setDoc(doc(db, 'projects', projectId), {
          ownerId: currentUser.uid,
          name: projectName,
          zone: zone,
          role: role,
          context: context,
          diagnosticPriorities: ["Risque inondation (ruissellement)"],
          criticalInfrastructures: "[]",
          selectedLevers: [],
          resilienceIndex: 45,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      onComplete();
    } catch (error) {
      console.error("Error creating project:", error);
      setIsSubmitting(false);
      alert("Une erreur s'est produite lors de la création du projet. Vérifiez vos permissions.");
    }
  };

  if (loadingAuth) {
    return <div className="min-h-screen bg-void flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div></div>;
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
          <p className="text-text-2 text-sm">Configurez un nouvel espace de travail isolé pour votre territoire.</p>
        </div>

        {!user ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-text-1 mb-4">Authentification requise pour sauvegarder vos projets</h2>
            <button 
              onClick={handleGoogleSignIn}
              className="mx-auto flex items-center justify-center space-x-3 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continuer avec Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">Nom du projet <span className="text-brand-red">*</span></label>
              <input 
                type="text" 
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ex: Plan de prévention 2026"
                className="w-full bg-void border border-border rounded-lg px-4 py-3 text-text-1 focus:outline-none focus:border-brand-teal transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">Territoire / Zone <span className="text-brand-red">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-text-3" />
                <input 
                  type="text" 
                  required
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="Ville, région ou adresse..."
                  className="w-full bg-void border border-border rounded-lg pl-12 pr-4 py-3 text-text-1 focus:outline-none focus:border-brand-teal transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">Votre Profil / Rôle</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={\`flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all \${role === r.id ? 'bg-brand-teal/10 border-brand-teal' : 'bg-void border-border hover:border-text-3'}\`}
                  >
                    <r.icon className={\`w-5 h-5 \${role === r.id ? 'text-brand-teal' : 'text-text-3'}\`} />
                    <span className={\`text-sm font-medium \${role === r.id ? 'text-brand-teal' : 'text-text-2'}\`}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-3 uppercase tracking-wider mb-2">Contexte (Optionnel)</label>
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
                  {user.email?.[0]}
                </div>
                <span>{user.email}</span>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || !projectName.trim() || !zone.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-brand-teal text-void font-bold rounded-lg hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
`;
fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
console.log("OnboardingScreen patched successfully");
