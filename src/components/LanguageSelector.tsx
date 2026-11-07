import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAgentStore } from "../stores/agentStore";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../i18n/config";
import { auth, db } from "../services/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

interface LanguageSelectorProps {
  variant?: "compact" | "pills" | "full";
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelector({ variant = "compact", className = "", showLabel = true }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation("common");
  const { language, setLanguage } = useAgentStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize active language from i18n or agentStore
  const activeCode = (i18n.language || language || "fr").split("-")[0] as SupportedLanguage;
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === activeCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    try {
      // 1. i18n switch
      await i18n.changeLanguage(code);

      // 2. Zustand store
      setLanguage(code);

      // 3. LocalStorage persistence
      localStorage.setItem("sponge_city_lang", code);
      localStorage.setItem("i18nextLng", code);

      // 4. Update HTML attributes for RTL/LTR and language tag
      document.documentElement.lang = code;
      document.documentElement.dir = code === "ar" ? "rtl" : "ltr";

      // 5. Cloud Firestore user profile persistence if logged in
      if (auth && auth.currentUser) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await setDoc(userRef, { language: code }, { merge: true });
        } catch (dbErr) {
          console.warn("Could not sync language to user profile in Firestore", dbErr);
        }
      }
    } catch (err) {
      console.error("Error changing language:", err);
    } finally {
      setIsOpen(false);
    }
  };

  if (variant === "pills") {
    return (
      <div className={`flex items-center space-x-1.5 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = lang.code === activeCode;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                isActive
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-surface/80 hover:bg-elevated text-text-3 hover:text-text-1 border border-border/60"
              }`}
              title={lang.label}
            >
              <span>{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = lang.code === activeCode;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue/50 text-white shadow-sm"
                  : "bg-surface hover:bg-elevated border-border text-text-2 hover:text-text-1"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <div className="text-[14px] font-medium text-text-1 flex items-center gap-2">
                    {lang.label}
                    <span className="text-[11px] text-text-3 uppercase tracking-wider">({lang.code})</span>
                  </div>
                  <div className="text-[11px] text-text-3">
                    {lang.code === "fr" && "Interface, rapports et IA en français"}
                    {lang.code === "en" && "UI, automated reports & AI in English"}
                    {lang.code === "de" && "Benutzeroberfläche und Berichte auf Deutsch"}
                    {lang.code === "ar" && "واجهة المستخدم والتقارير باللغة العربية"}
                  </div>
                </div>
              </div>
              {isActive && (
                <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Compact variant for Header
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-surface/80 hover:bg-elevated border border-border/80 rounded-lg text-xs font-medium text-text-2 hover:text-text-1 transition-all focus:outline-none focus:ring-1 focus:ring-brand-blue/50"
        title="Changer de langue / Switch language"
        aria-label="Language selector"
      >
        <Globe className="w-3.5 h-3.5 text-brand-teal" />
        <span className="text-[13px]">{currentLang.flag}</span>
        {showLabel && <span className="font-semibold uppercase text-[11px] text-text-1">{currentLang.code}</span>}
        <ChevronDown className={`w-3 h-3 text-text-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-surface border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-text-3 border-b border-border/50 mb-1">
            {t("language.title") || "Langue / Language"}
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang.code === activeCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isActive
                    ? "bg-brand-blue/15 text-brand-blue font-semibold"
                    : "text-text-2 hover:text-text-1 hover:bg-elevated"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-brand-blue" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
