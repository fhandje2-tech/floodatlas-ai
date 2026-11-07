import React, { useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Download, 
  ExternalLink, 
  X, 
  Building2, 
  UserCheck, 
  Award, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Compass, 
  ChevronRight,
  Maximize2
} from "lucide-react";

interface ThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThesisModal({ isOpen, onClose }: ThesisModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "framework" | "viewer">("overview");

  if (!isOpen) return null;

  const pdfUrl = "/assets/aistudio/Memoire_Fabien_HANDJE_MTU__1___1__89edad6c.pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-body">
      <div 
        className="bg-[#0b101d] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-brand-blue/15 via-surface to-brand-teal/10 flex items-start justify-between relative">
          <div className="flex items-start space-x-3.5 pr-8">
            <div className="p-3 rounded-xl bg-brand-blue/20 border border-brand-blue/40 text-brand-blue shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
              <GraduationCap className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                  Thèse Professionnelle de MBA
                </span>
                <span className="text-[10px] font-mono text-text-3">
                  De Vinci Executive Education &bull; 2026
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-text-1 leading-snug">
                De la gestion de crise à la résilience territoriale
              </h2>
              <p className="text-xs text-text-3 mt-0.5 italic">
                Comment FloodAtlas AI peut-il aider les villes à anticiper, visualiser et réduire le risque de crue ?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-void/80 border border-white/10 text-text-3 hover:text-white hover:bg-elevated transition-colors cursor-pointer shrink-0"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 py-2.5 bg-void/80 border-b border-white/5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-white/10 text-white font-semibold shadow-sm"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Contexte & Synthèse</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("framework")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "framework"
                  ? "bg-white/10 text-white font-semibold shadow-sm"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Les 6 Dimensions de Résilience</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("viewer")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "viewer"
                  ? "bg-white/10 text-white font-semibold shadow-sm"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lecteur PDF (57 pages)</span>
            </button>
          </div>

          {/* Direct Download PDF Button */}
          <a
            href={pdfUrl}
            download="Memoire_Fabien_HANDJE_FloodAtlas_AI_MBA_MTU.pdf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold transition-all shadow-sm text-xs cursor-pointer shrink-0"
            title="Télécharger le mémoire complet (PDF)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Télécharger le Mémoire</span>
          </a>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Identification Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Auteur du travail
                  </span>
                  <div className="font-semibold text-text-1 text-sm">Fabien Aimé HANDJE POUNJIEU</div>
                  <p className="text-[11px] text-text-3 leading-relaxed">
                    Ingénieur civil de formation, auditeur & expert en transitions urbaines.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Formation & Établissement
                  </span>
                  <div className="font-semibold text-text-1 text-sm">MBA Management des Transitions Urbaines</div>
                  <p className="text-[11px] text-text-3 leading-relaxed">
                    Développement des Territoires &mdash; De Vinci Executive Education.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-amber flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Encadrement & Cadre
                  </span>
                  <div className="font-semibold text-text-1 text-sm">gaea21 &bull; Dir. Laurent JULVEZ</div>
                  <p className="text-[11px] text-text-3 leading-relaxed">
                    Pôles Architecture verte & Smart Cities (gaea21). Direction pédagogique de M. Laurent JULVEZ.
                  </p>
                </div>
              </div>

              {/* Research Thesis Abstract / Avant-propos */}
              <div className="p-5 rounded-2xl bg-surface/70 border border-white/10 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Problématique de recherche
                </h3>
                <blockquote className="p-4 rounded-xl bg-void border-l-4 border-brand-teal text-text-1 text-[13px] leading-relaxed italic">
                  &laquo; Dans quelle mesure une plateforme d'IA verticale comme FloodAtlas AI peut-elle aider les territoires urbains à sortir d'une logique de gestion de crise pour entrer dans une logique de résilience territoriale, en identifiant les paramètres de vulnérabilité, en comparant des stratégies d'adaptation fondées sur l'aménagement autant que sur l'hydraulique, et en proposant des scénarios réplicables à l'international ? &raquo;
                </blockquote>
                <p className="text-xs text-text-2 leading-relaxed">
                  Ce travail de mémoire défend l'idée que les inondations urbaines ne relèvent pas d'un problème strictement hydraulique mais d'un <strong>système territorial global</strong> : l'artificialisation continue des sols, l'imperméabilisation et la disparition des zones humides transforment chaque événement pluvieux en crise. FloodAtlas AI a été conçu et expérimenté pour concrétiser cette rupture de paradigme.
                </p>
              </div>

              {/* Research Methodology & gaea21 mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                    Mission au sein de gaea21
                  </h4>
                  <p className="text-[11px] text-text-3 leading-relaxed">
                    Développé au sein des pôles <em>Architecture verte</em> et <em>Smart Cities</em> de l'association gaea21 (Genève), le projet s'appuie sur le Cadre de Sendai, les travaux du GIEC, le CEREMA, l'Office International de l'Eau (OiEau) et les programmes internationaux (<em>Sponge City</em>, <em>Room for the River</em>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-teal" />
                    Du mémoire au jumeau numérique
                  </h4>
                  <p className="text-[11px] text-text-3 leading-relaxed">
                    FloodAtlas AI dépasse le simple affichage cartographique : l'outil agit comme un module d'aide à la décision territoriale et une brique de jumeau numérique urbain, capable d'arbitrer objectivement entre 8 leviers d'adaptation Ville Éponge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "framework" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-text-3 leading-relaxed">
                Le mémoire structure la résilience des villes face au risque de crue autour de <strong>6 dimensions fondamentales</strong>, toutes implémentées dans l'application FloodAtlas AI :
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    num: "1",
                    title: "Connaissance du risque par la donnée",
                    enjeu: "Fiabilité et actualisation des données territoriales",
                    apport: "Agrégation multi-sources MNT, OpenStreetMap certifié, occupation des sols et pluviométrie."
                  },
                  {
                    num: "2",
                    title: "Anticipation & prévision",
                    enjeu: "Délai et fiabilité de l'alerte précoce",
                    apport: "Simulation des scénarios de crues décennale (Q10) et centennale (Q100), alertes automatiques."
                  },
                  {
                    num: "3",
                    title: "Réduction de la vulnérabilité",
                    enjeu: "Diminution de l'exposition des enjeux humains & bâtis",
                    apport: "Diagnostic des infrastructures critiques (hôpitaux, écoles, gares) et indice de résilience 0-100."
                  },
                  {
                    num: "4",
                    title: "Adaptation des formes urbaines",
                    enjeu: "Conception d'espaces absorbants & villes éponges",
                    apport: "Comparateur de 8 leviers (désimperméabilisation, noues paysagères, toitures végétalisées, bassins)."
                  },
                  {
                    num: "5",
                    title: "Gouvernance & coordination des acteurs",
                    enjeu: "Décloisonnement GEMAPI, élus, techniciens, riverains",
                    apport: "Rapports d'aide à la décision exportables pour PCAET, PAPI et PLU, support de dialogue partagé."
                  },
                  {
                    num: "6",
                    title: "Capacité de décision rapide et éclairée",
                    enjeu: "Rapidité et pertinence des arbitrages en crise",
                    apport: "Copilote Atlas IA, scénarisation en temps réel et chiffrage économique CAPEX/OPEX."
                  }
                ].map((dim) => (
                  <div key={dim.num} className="p-4 rounded-xl bg-surface border border-white/5 space-y-1.5 hover:border-brand-teal/40 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-brand-teal/20 text-brand-teal border border-brand-teal/30 text-[11px] font-bold flex items-center justify-center font-mono">
                        {dim.num}
                      </span>
                      <h4 className="font-semibold text-xs text-text-1">{dim.title}</h4>
                    </div>
                    <div className="text-[11px] text-text-3">
                      <strong>Enjeu :</strong> {dim.enjeu}
                    </div>
                    <div className="text-[11px] text-brand-blue/90">
                      <strong>Implémentation FloodAtlas AI :</strong> {dim.apport}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "viewer" && (
            <div className="h-[520px] w-full rounded-xl overflow-hidden border border-white/10 bg-void flex flex-col animate-in fade-in duration-150">
              <div className="p-2.5 bg-surface border-b border-white/10 flex items-center justify-between text-xs text-text-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="w-3.5 h-3.5 text-brand-blue" />
                  Mémoire MBA complet (57 pages) &mdash; Fabien Aimé HANDJE POUNJIEU
                </span>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-blue hover:text-white transition-colors"
                >
                  <span>Ouvrir en plein écran</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full flex-1 border-0"
                title="Mémoire de MBA - FloodAtlas AI"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-text-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-teal" />
            <span>Travaux universitaires & recherche appliquée &bull; 2026</span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-2 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Consulter le PDF</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-surface border border-white/10 text-text-1 hover:bg-elevated transition-colors cursor-pointer font-medium"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
