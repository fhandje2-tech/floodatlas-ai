import { useAgentStore } from '../stores/agentStore';
import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import { auth, db, googleProvider } from "../services/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const translations: Record<string, any> = {
  en: {
    emailReq: "Please enter your email address.",
    errInvalidCred: "Invalid email or password.",
    errEmailInUse: "Email already registered. Sign in instead?",
    pwdMismatch: "Passwords do not match.",
    signIn: "Sign in",
    createAccount: "Create account",
    resetSent: "If an account exists with this email, a password reset link has been sent.",
    fullName: "Full name",
    workEmail: "Work email",
    password: "Password",
    confirmPwd: "Confirm password",
    yourRole: "Your role",
    rememberMe: "Remember me",
    forgotPwd: "Forgot password?",
    pleaseWait: "Please wait...",
    or: "or",
    continueGoogle: "Continue with Google",
    agreeTo: "By continuing, you agree to our ",
    tos: "Terms of Service",
    and: " and ",
    privacy: "Privacy Policy",
    roles: ["Municipality", "Developer", "Consultancy", "Risk Manager", "Researcher / Expert", "Other"]
  },
  fr: {
    emailReq: "Veuillez entrer votre adresse email.",
    errInvalidCred: "Email ou mot de passe invalide.",
    errEmailInUse: "Email déjà utilisé. Connectez-vous plutôt ?",
    pwdMismatch: "Les mots de passe ne correspondent pas.",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    resetSent: "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.",
    fullName: "Nom complet",
    workEmail: "Email professionnel",
    password: "Mot de passe",
    confirmPwd: "Confirmer le mot de passe",
    yourRole: "Votre rôle",
    rememberMe: "Se souvenir de moi",
    forgotPwd: "Mot de passe oublié ?",
    pleaseWait: "Veuillez patienter...",
    or: "ou",
    continueGoogle: "Continuer avec Google",
    agreeTo: "En continuant, vous acceptez nos ",
    tos: "Conditions d'utilisation",
    and: " et notre ",
    privacy: "Politique de confidentialité",
    roles: ["Collectivité", "Aménageur", "Bureau d'études", "Gestionnaire de risques", "Chercheur / Expert", "Autre"]
  },
  de: {
    emailReq: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
    errInvalidCred: "Ungültige E-Mail oder Passwort.",
    errEmailInUse: "E-Mail bereits registriert. Stattdessen anmelden?",
    pwdMismatch: "Passwörter stimmen nicht überein.",
    signIn: "Anmelden",
    createAccount: "Konto erstellen",
    resetSent: "Wenn ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
    fullName: "Vollständiger Name",
    workEmail: "Geschäftliche E-Mail",
    password: "Passwort",
    confirmPwd: "Passwort bestätigen",
    yourRole: "Ihre Rolle",
    rememberMe: "Angemeldet bleiben",
    forgotPwd: "Passwort vergessen?",
    pleaseWait: "Bitte warten...",
    or: "oder",
    continueGoogle: "Weiter mit Google",
    agreeTo: "Mit dem Fortfahren stimmen Sie unseren ",
    tos: "Nutzungsbedingungen",
    and: " und ",
    privacy: "Datenschutzbestimmungen",
    roles: ["Kommune", "Entwickler", "Beratung", "Risikomanager", "Forscher / Experte", "Andere"]
  },
  ar: {
    emailReq: "الرجاء إدخال عنوان البريد الإلكتروني.",
    errInvalidCred: "البريد الإلكتروني أو كلمة المرور غير صالحة.",
    errEmailInUse: "البريد الإلكتروني مسجل بالفعل. تسجيل الدخول بدلاً من ذلك؟",
    pwdMismatch: "كلمات المرور غير متطابقة.",
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    resetSent: "إذا كان هناك حساب بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة التعيين.",
    fullName: "الاسم الكامل",
    workEmail: "البريد الإلكتروني للعمل",
    password: "كلمة المرور",
    confirmPwd: "تأكيد كلمة المرور",
    yourRole: "دورك",
    rememberMe: "تذكرنى",
    forgotPwd: "هل نسيت كلمة المرور؟",
    pleaseWait: "يرجى الانتظار...",
    or: "أو",
    continueGoogle: "المتابعة باستخدام Google",
    agreeTo: "بالمتابعة ، فإنك توافق على ",
    tos: "شروط الخدمة",
    and: " و ",
    privacy: "سياسة الخصوصية",
    roles: ["بلدية", "مطور", "استشارات", "مدير المخاطر", "باحث / خبير", "أخرى"]
  }
};

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function AuthScreen() {
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Collectivité");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [language, setLanguage] = useState<"en" | "fr" | "ar" | "de">(() => {
    try {
      const stored = localStorage.getItem("sponge_city_lang") || localStorage.getItem("i18nextLng") || useAgentStore.getState().language;
      if (stored && ["en", "fr", "ar", "de"].includes(stored)) {
        return stored as "en" | "fr" | "ar" | "de";
      }
    } catch (e) {}
    return "fr";
  });

  const switchLanguage = (newLang: "en" | "fr" | "ar" | "de") => {
    setLanguage(newLang);
    useAgentStore.getState().setLanguage(newLang);
    i18n.changeLanguage(newLang);
    try {
      localStorage.setItem("sponge_city_lang", newLang);
      localStorage.setItem("i18nextLng", newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    } catch (e) {}
  };

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language, i18n]);

  // Password strength logic
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumberOrSymbol = /[^a-zA-Z\s]/.test(password);
  const strengthScore = [hasLength, hasUpper, hasNumberOrSymbol].filter(Boolean).length + (password.length > 0 ? 1 : 0);
  
  
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!db) {
          navigate("/dashboard");
          return;
        }
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          // Check for existing projects in Firestore
          const projectsQ = query(collection(db, "projects"), where("ownerId", "==", user.uid));
          const projectsSnap = await getDocs(projectsQ);
          const hasExistingProjects = !projectsSnap.empty || Object.keys(useAgentStore.getState().projects || {}).length > 0;

          // Priority to chosen language: ensure current selection persists
          const storedLang = localStorage.getItem("sponge_city_lang") || language;
          if (storedLang && ["en", "fr", "ar", "de"].includes(storedLang)) {
            setLanguage(storedLang as any);
            useAgentStore.getState().setLanguage(storedLang);
            i18n.changeLanguage(storedLang);
            setDoc(userRef, { language: storedLang }, { merge: true }).catch(() => {});
          } else if (userSnap.exists() && userSnap.data()?.language) {
            const dataLang = userSnap.data().language;
            setLanguage(dataLang);
            useAgentStore.getState().setLanguage(dataLang);
            i18n.changeLanguage(dataLang);
          }

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.onboardingComplete || hasExistingProjects) {
              navigate("/dashboard");
            } else {
              useAgentStore.getState().setRole(data.role || "Collectivité");
              navigate("/onboarding");
            }
          } else if (hasExistingProjects) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        } catch (err) {
          console.error("Error auto-login:", err);
          navigate("/dashboard");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, i18n, language]);


  // Switch role text based on language
  useEffect(() => {
    if (language === "en") {
      if (role === "Collectivité" || role === "Kommune" || role === "بلدية") setRole("Municipality");
      else if (role === "Aménageur" || role === "Entwickler" || role === "مطور") setRole("Developer");
      else if (role === "Bureau d'études" || role === "Beratung" || role === "استشارات") setRole("Consultancy");
      else if (role === "Gestionnaire de risques" || role === "Risikomanager" || role === "مدير المخاطر") setRole("Risk Manager");
      else if (role === "Chercheur / Expert" || role === "Forscher / Experte" || role === "باحث / خبير") setRole("Researcher / Expert");
      else if (role === "Autre" || role === "Andere" || role === "أخرى") setRole("Other");
    } else if (language === "fr") {
      if (role === "Municipality" || role === "Kommune" || role === "بلدية") setRole("Collectivité");
      else if (role === "Developer" || role === "Entwickler" || role === "مطور") setRole("Aménageur");
      else if (role === "Consultancy" || role === "Beratung" || role === "استشارات") setRole("Bureau d'études");
      else if (role === "Risk Manager" || role === "Risikomanager" || role === "مدير المخاطر") setRole("Gestionnaire de risques");
      else if (role === "Researcher / Expert" || role === "Forscher / Experte" || role === "باحث / خبير") setRole("Chercheur / Expert");
      else if (role === "Other" || role === "Andere" || role === "أخرى") setRole("Autre");
    } else if (language === "de") {
      if (role === "Municipality" || role === "Collectivité" || role === "بلدية") setRole("Kommune");
      else if (role === "Developer" || role === "Aménageur" || role === "مطور") setRole("Entwickler");
      else if (role === "Consultancy" || role === "Bureau d'études" || role === "استشارات") setRole("Beratung");
      else if (role === "Risk Manager" || role === "Gestionnaire de risques" || role === "مدير المخاطر") setRole("Risikomanager");
      else if (role === "Researcher / Expert" || role === "Chercheur / Expert" || role === "باحث / خبير") setRole("Forscher / Experte");
      else if (role === "Other" || role === "Autre" || role === "أخرى") setRole("Andere");
    } else if (language === "ar") {
      if (role === "Municipality" || role === "Collectivité" || role === "Kommune") setRole("بلدية");
      else if (role === "Developer" || role === "Aménageur" || role === "Entwickler") setRole("مطور");
      else if (role === "Consultancy" || role === "Bureau d'études" || role === "Beratung") setRole("استشارات");
      else if (role === "Risk Manager" || role === "Gestionnaire de risques" || role === "Risikomanager") setRole("مدير المخاطر");
      else if (role === "Researcher / Expert" || role === "Chercheur / Expert" || role === "Forscher / Experte") setRole("باحث / خبير");
      else if (role === "Other" || role === "Autre" || role === "Andere") setRole("أخرى");
    }
  }, [language]);

  const getStrengthColor = (index: number) => {
    if (index >= strengthScore) return "bg-border";
    if (strengthScore === 1) return "bg-brand-red";
    if (strengthScore === 2) return "bg-brand-amber";
    if (strengthScore === 3) return "bg-brand-blue";
    return "bg-brand-teal";
  };

  const handleAuthSuccess = async (user: any) => {
    // 1. Immediately persist language to store, localStorage and i18n
    useAgentStore.getState().setRole(role);
    useAgentStore.getState().setLanguage(language);
    i18n.changeLanguage(language);
    try {
      localStorage.setItem("sponge_city_lang", language);
      localStorage.setItem("i18nextLng", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    } catch (e) {}

    if (!db) {
      // Offline/mock mode
      const hasLocalProjects = Object.keys(useAgentStore.getState().projects || {}).length > 0;
      navigate(hasLocalProjects ? "/dashboard" : "/onboarding");
      return;
    }
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Check for existing projects in Firestore
      const projectsQ = query(collection(db, "projects"), where("ownerId", "==", user.uid));
      const projectsSnap = await getDocs(projectsQ);
      const hasProjects = !projectsSnap.empty || Object.keys(useAgentStore.getState().projects || {}).length > 0;
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        // Persist language chosen at login to user profile in Firestore
        await setDoc(userRef, { language }, { merge: true });

        if (data.onboardingComplete || hasProjects) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        // Create new user profile with chosen language
        await setDoc(userRef, {
          email: user.email,
          name: name || user.displayName || "",
          role: role,
          language: language,
          onboardingComplete: hasProjects,
          createdAt: new Date().toISOString(),
        });
        navigate(hasProjects ? "/dashboard" : "/onboarding");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      navigate("/dashboard");
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError({ field: "email", message: t("emailReq") });
      return;
    }
    
    if (!auth) {
      setResetSent(true);
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      // Expected user error
      setError(mapFirebaseError(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  const mapFirebaseError = (errCode: string, fallbackMessage?: string) => {
    const t = translations[language] || translations.en;
    switch (errCode) {
      case "auth/user-not-found": return { field: "email", message: t("errInvalidCred") || "Invalid credentials." };
      case "auth/wrong-password": return { field: "password", message: t("errInvalidCred") || "Invalid credentials." };
      case "auth/invalid-credential": return { message: t("errInvalidCred") || "Invalid email or password." };
      case "auth/email-already-in-use": return { field: "email", message: t("errEmailInUse") || "Already registered. Sign in instead?" };
      case "auth/network-request-failed": return { message: "Check your connection and try again." };
      case "auth/unauthorized-domain": return { message: `Domain not authorized. Please add "${window.location.hostname}" to Authorized Domains in Firebase Console (Authentication > Settings).` };
      case "auth/configuration-not-found": return { message: "Sign-in method not enabled in Firebase Console. Please enable Email/Password and Google sign-in." };
      case "auth/operation-not-allowed": return { message: "Sign-in method not enabled in Firebase Console. Please enable Email/Password and Google sign-in." };
      case "auth/popup-closed-by-user": return { message: "Sign-in popup was closed." };
      default: return { message: fallbackMessage || errCode || "An unexpected error occurred." };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!auth) {
      // Mock mode
      setTimeout(() => {
        setLoading(false);
        handleAuthSuccess({ uid: "mock123", email });
      }, 800);
      return;
    }

    try {
      if (tab === "signin") {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(cred.user);
      } else {
        if (password !== confirmPassword) {
          setError({ field: "confirmPassword", message: t("pwdMismatch") });
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(cred.user);
      }
    } catch (err: any) {
      // Expected user error
      setError(mapFirebaseError(err.code, err.message));
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!auth || !googleProvider) {
      handleAuthSuccess({ uid: "mock123", email: "mock@google.com" });
      return;
    }
    
    // Suggest opening in a new tab if running in an iframe (common for OAuth in preview)
    if (window !== window.parent) {
      setError({ message: "Google Sign-In is blocked inside the preview iframe. Please open the app in a new tab (click the ↗ icon in the top right)." });
      return;
    }

    try {
      setLoading(true);
      const cred = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(cred.user);
    } catch (err: any) {
      // Expected user error
      setError(mapFirebaseError(err.code, err.message));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-text-1 flex flex-col lg:flex-row">
      {/* Left Column (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-surface overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1024')`,
            opacity: 0.3
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
        
        <div className="absolute bottom-12 left-10 z-10 max-w-md">
          <span className="inline-block px-3 py-1 bg-brand-amber/20 border border-brand-amber text-brand-amber text-[11px] font-semibold rounded-full mb-6">
            BETA v1.0
          </span>
          <h2 className="font-display font-bold text-text-1 leading-[1.1] mb-8" style={{ fontSize: '44px' }}>
            Flood risk,<br />decision-ready.
          </h2>
          
          <div className="space-y-3 font-body text-[13px] text-text-2 font-medium">
            <div className="flex items-center space-x-2">
              <span className="text-brand-blue font-bold w-12 text-right"><AnimatedCounter value={15} />,<AnimatedCounter value={0} />00+</span>
              <span>{t("stats.territories")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-brand-blue font-bold w-12 text-right"><AnimatedCounter value={2} />.<AnimatedCounter value={4} />M</span>
              <span>{t("stats.parcels")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-brand-blue font-bold w-12 text-right"><AnimatedCounter value={94} />%</span>
              <span>{t("stats.accuracy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 bg-surface relative">
        <div className="absolute top-6 right-6 z-10 flex items-center space-x-2">
          {(["en", "fr", "de", "ar"] as const).map((code) => {
            const isActive = language === code;
            return (
              <button 
                key={code}
                type="button"
                onClick={() => switchLanguage(code)}
                className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                  isActive 
                    ? "bg-brand-blue text-white shadow-sm" 
                    : "text-text-3 hover:text-text-1 hover:bg-elevated"
                }`}
              >
                {code.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center lg:mb-12 mb-8">
            <h1 className="font-display font-bold text-text-2 tracking-widest text-[22px]">FLOODATLAS</h1>
          </div>

          {/* Tab Switcher */}
          <div className="flex w-full border-b border-border mb-8 relative">
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 pb-3 text-[15px] font-medium transition-colors ${tab === "signin" ? "text-text-1" : "text-text-2"}`}
            >
              {t("signIn")}
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 pb-3 text-[15px] font-medium transition-colors ${tab === "signup" ? "text-text-1" : "text-text-2"}`}
            >
              {t("createAccount")}
            </button>
            {/* Active Tab Indicator */}
            <motion.div 
              className="absolute bottom-0 h-[2px] bg-brand-teal w-1/2"
              animate={{ x: tab === "signin" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Error Alert */}
          {error && !error.field && (
            <div className="mb-6 p-3 bg-brand-red-dim/20 border border-brand-red rounded-md flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
              <div className="text-[12px] text-brand-red flex-1">
                <p>{error.message}</p>
                {error.message.includes("iframe") && (
                  <div className="mt-2">
                    <a 
                      href={window.location.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1.5 bg-brand-red text-white rounded font-medium hover:bg-brand-red/90 shadow-sm"
                    >
                      Open in New Tab ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Reset password success */}
          {resetSent && (
            <div className="mb-6 p-3 bg-brand-teal/20 border border-brand-teal rounded-md flex items-start space-x-2">
              <Check className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
              <div className="text-[12px] text-brand-teal flex-1">
                <p>{t("resetSent")}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <Input 
                placeholder={t("fullName")}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            
            <div>
              <Input 
                type="email" 
                placeholder={tab === "signin" ? "name@organisation.fr" : (t("workEmail"))}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error?.field === "email" ? error.message : undefined}
                required
              />
            </div>

            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder={t("password")}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                error={error?.field === "password" ? error.message : undefined}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[14px] text-text-3 hover:text-text-2 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {tab === "signup" && (
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t("confirmPwd")}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={error?.field === "confirmPassword" ? error.message : undefined}
                  required
                />
              </div>
            )}

            {/* Password Strength Indicator (Signup only) */}
            {tab === "signup" && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((index) => (
                    <div 
                      key={index} 
                      className={`h-1 w-1/4 rounded-full transition-colors ${getStrengthColor(index)}`} 
                    />
                  ))}
                </div>
                {passwordFocused && (
                  <div className="text-[12px] text-text-3 space-y-1 pt-1 pl-1">
                    <div className="flex items-center space-x-1"><Check className={`w-3 h-3 ${hasLength ? "text-brand-teal" : "opacity-0"}`} /><span>8+ characters</span></div>
                    <div className="flex items-center space-x-1"><Check className={`w-3 h-3 ${hasUpper ? "text-brand-teal" : "opacity-0"}`} /><span>One uppercase letter</span></div>
                    <div className="flex items-center space-x-1"><Check className={`w-3 h-3 ${hasNumberOrSymbol ? "text-brand-teal" : "opacity-0"}`} /><span>One number or symbol</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Role Selector (Signup only) */}
            {tab === "signup" && (
              <div className="pt-2">
                <label className="text-[13px] font-medium text-text-2 mb-1 block">
                  {t("yourRole")}
                </label>
                <select 
                  className="w-full h-12 rounded-md border border-border bg-void px-3 py-2 text-sm text-text-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {Object.values(t("roles", { returnObjects: true }) as Record<string, string>).map((r: string) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Remember Me / Forgot Password (Signin only) */}
            {tab === "signin" && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border bg-void text-brand-blue focus:ring-brand-blue w-4 h-4" />
                  <span className="text-[13px] text-text-2">{t("rememberMe")}</span>
                </label>
                <a 
                  href="#" 
                  onClick={handleResetPassword}
                  className="text-[13px] text-brand-blue hover:text-brand-blue-dim transition-colors"
                >
                  {t("forgotPwd")}
                </a>
              </div>
            )}

            <Button type="submit" fullWidth className="mt-6" disabled={loading}>
              {loading 
                ? (t("pleaseWait")) 
                : tab === "signin" 
                  ? (t("signIn")) 
                  : (t("createAccount"))
              }
            </Button>
          </form>

          <div className="flex items-center justify-center space-x-4 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-[13px] text-text-3 font-body">— {t("or")} —</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <Button variant="secondary" fullWidth onClick={handleGoogleAuth} disabled={loading} className="space-x-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{t("continueGoogle")}</span>
          </Button>

          <p className="text-center text-[11px] text-text-3 mt-8">
            {t("agreeTo")}
            <a href="#" className="underline hover:text-text-2">{t("tos")}</a> 
            {t("and")}
            <a href="#" className="underline hover:text-text-2">{t("privacy")}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
