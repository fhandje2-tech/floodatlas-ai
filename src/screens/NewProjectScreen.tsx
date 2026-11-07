import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAgentStore } from "../stores/agentStore";
import { Button } from "../components/ui/Button";
import { Target, Map as MapIcon, Plus, ArrowRight } from "lucide-react";
import { AddressAutocomplete } from "../components/AddressAutocomplete";
import { motion } from "motion/react";

export function NewProjectScreen() {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const { createProject, language, role, setRole } = useAgentStore();
  
  const [name, setName] = useState("");
  const [zone, setZone] = useState("");
  const [context, setContext] = useState("");
  const [localRole, setLocalRole] = useState(role || "Collectivité");
  
  const handleZoneChange = (newZone: string) => {
    setZone(newZone);
    if (!name.trim() && newZone.trim()) {
      const city = newZone.split(",")[0].trim();
      setName(`Résilience & Ville Éponge - ${city}`);
    }
  };

  const handleCreate = () => {
    if (!name || !zone) return;
    setRole(localRole); // Update global role if they changed it
    const id = createProject(name, zone, language, context);
    navigate(`/project/${id}/assistant`);
  };

  const roles = [
    { id: "Collectivité", label: t("roles.Municipality"), icon: "🏛️" },
    { id: "Aménageur", label: t("roles.Developer"), icon: "🏗️" },
    { id: "Bureau d'études", label: t("roles.Consultancy"), icon: "📐" },
    { id: "Gestionnaire de risques", label: t("roles.RiskManager"), icon: "🛡️" }
  ];

  return (
    <div className="flex-1 h-full bg-void overflow-y-auto p-6 font-body flex flex-col">
      <div className="m-auto w-full max-w-xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-display font-bold text-text-1 mb-2">
          {t("newProjectTitle")}
        </h2>
        <p className="text-text-3 text-[13px] mb-8">
          {t("newProjectDesc")}
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-2">
              {t("projectName")} <span className="text-brand-red">*</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-void border border-border rounded-lg px-4 py-3 text-[14px] text-text-1 focus:border-brand-teal outline-none transition-colors"
              placeholder={t("projectNamePlaceholder")}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-2">
              {t("territoryZone")} <span className="text-brand-red">*</span>
            </label>
            <AddressAutocomplete 
              value={zone} 
              onChange={handleZoneChange} 
              onSelect={handleZoneChange}
              placeholder={t("territoryZonePlaceholder")} 
            />
          </div>
          
          <div>
            <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-3">
              {t("yourProfile")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setLocalRole(r.id)}
                  className={`flex items-center p-3 rounded-lg border text-left transition-colors ${localRole === r.id ? "bg-brand-teal/10 border-brand-teal" : "bg-void border-border hover:border-text-3"}`}
                >
                  <span className="text-lg mr-2">{r.icon}</span>
                  <span className={`text-[13px] ${localRole === r.id ? "text-brand-teal font-medium" : "text-text-1"}`}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-2">
              {t("briefContext")}
            </label>
            <textarea 
              value={context}
              onChange={e => setContext(e.target.value)}
              className="w-full bg-void border border-border rounded-lg px-4 py-3 text-[14px] text-text-1 focus:border-brand-teal outline-none transition-colors resize-none h-24"
              placeholder={t("briefContextPlaceholder")}
            />
          </div>
          
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-border">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={!name || !zone}>
            {t("createProject")} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
