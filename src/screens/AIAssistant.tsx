import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Map as MapIcon, 
  Target, 
  FileBarChart, 
  Waves, 
  Sparkles, 
  Mic, 
  MicOff, 
  Paperclip, 
  Layers, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  X, 
  FileCode,
  CheckCircle2
} from "lucide-react";
import { useAgentStore } from "../stores/agentStore";
import { useNavigate } from "react-router";
import { auth } from "../services/firebase";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'geojson' | 'gis' | 'tabular' | 'pdf' | 'image' | 'doc';
  previewUrl?: string;
  base64?: string;
  mimeType?: string;
  contentExcerpt?: string;
}

export function AIAssistant({ isSplit }: { isSplit?: boolean }) {
  const { currentProjectId, projects, setMessages, isTyping, setIsTyping, role, language } = useAgentStore();
  const project = currentProjectId ? projects[currentProjectId] : null;
  const activeZone = project?.activeZone || null;
  const selectedLevers = project?.selectedLevers || [];
  const resilienceIndex = project?.resilienceIndex || 45;
  const messages = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].messages || [] : [];
  
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const zoneName = activeZone ? activeZone.split(",")[0] : (language === "en" ? "your territory" : "mon territoire");
  
  let quickRequests = [
    `Propose des solutions de désimperméabilisation et "Ville Éponge" pour ${zoneName}`,
    `Quels sont les leviers d'adaptation prioritaires face aux ruissellements sur ${zoneName} ?`,
    `Génère un diagnostic de résilience et un plan d'actions pour ${zoneName}`
  ];

  if (role === "Public Official") {
    quickRequests = [
      `Génère une note de synthèse sur les risques inondation pour les élus de ${zoneName}`,
      `Quels aménagements "Ville Éponge" intégrer au PLU de ${zoneName} ?`,
      `Quels financements pour désimperméabiliser ${zoneName} ?`
    ];
  } else if (role === "Urban Planner") {
    quickRequests = [
      `Simule l'impact de la désimperméabilisation des parkings sur ${zoneName}`,
      `Quels sont les quartiers les plus vulnérables aux ruissellements sur ${zoneName} ?`,
      `Propose un schéma directeur de gestion des eaux pluviales pour ${zoneName}`
    ];
  } else if (role === "Real Estate Developer") {
    quickRequests = [
      `Évalue le risque d'inondation pour un nouveau projet immobilier sur ${zoneName}`,
      `Quelles solutions de toitures végétalisées et noues paysagères pour un projet à ${zoneName} ?`,
      `Impact de la réglementation ZAN sur les projets à ${zoneName}`
    ];
  } else if (role === "Insurer") {
    quickRequests = [
      `Évalue l'exposition globale du portefeuille aux risques climatiques sur ${zoneName}`,
      `Simule le coût des dommages pour une crue centennale sur ${zoneName}`,
      `Quel ROI pour les mesures de résilience urbaine sur ${zoneName} ?`
    ];
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, attachedFiles]);

  // Voice speech recognition toggle
  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const unsupportedMsg = language === "en" 
        ? "Speech recognition is not supported in this browser (please use Chrome, Edge, or Safari)."
        : "La reconnaissance vocale n'est pas supportée sur ce navigateur (privilégiez Chrome ou Edge).";
      setSpeechNotice(unsupportedMsg);
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        fr: "fr-FR",
        en: "en-US",
        de: "de-DE",
        ar: "ar-SA"
      };
      recognition.lang = langMap[language] || "fr-FR";

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechNotice(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          setSpeechNotice(
            language === "en" 
              ? "Microphone access denied. Please allow microphone in browser settings."
              : "Accès au microphone refusé. Veuillez l'autoriser dans les paramètres du navigateur."
          );
        } else if (event.error !== "no-speech") {
          setSpeechNotice(
            language === "en" 
              ? "Speech capture error. Please retry."
              : "Erreur de capture vocale. Veuillez réessayer."
          );
        }
        setTimeout(() => setSpeechNotice(null), 4000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
      setSpeechNotice("Impossible de démarrer le microphone.");
      setTimeout(() => setSpeechNotice(null), 3500);
    }
  };

  // File selection handler
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const name = file.name;
      const size = file.size;
      const ext = name.split(".").pop()?.toLowerCase() || "";
      
      let category: AttachedFile["category"] = "doc";
      if (["geojson", "json"].includes(ext)) category = "geojson";
      else if (["kml", "kmz", "shp", "zip"].includes(ext)) category = "gis";
      else if (["csv", "tsv", "xlsx", "xls"].includes(ext)) category = "tabular";
      else if (["pdf"].includes(ext)) category = "pdf";
      else if (file.type.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext)) category = "image";

      const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (category === "image") {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: fileId,
              name,
              size,
              type: file.type || "image/png",
              category: "image",
              previewUrl: dataUrl,
              base64,
              mimeType: file.type || "image/png"
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else if (category === "geojson" || category === "tabular" || ["txt", "md", "csv", "json"].includes(ext)) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          let excerpt = text.slice(0, 5000);
          if (category === "geojson") {
            try {
              const parsed = JSON.parse(text);
              const count = parsed.features ? parsed.features.length : (Array.isArray(parsed) ? parsed.length : 1);
              excerpt = `[GeoJSON validé : ${count} éléments géographiques détectés]\n${excerpt}`;
            } catch {}
          }
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: fileId,
              name,
              size,
              type: file.type || "application/octet-stream",
              category,
              contentExcerpt: excerpt
            }
          ]);
        };
        reader.readAsText(file);
      } else {
        // PDF or archive
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: fileId,
            name,
            size,
            type: file.type || "application/pdf",
            category,
            contentExcerpt: `Document technique ${category.toUpperCase()} joint : ${name} (${Math.round(size / 1024)} Ko)`
          }
        ]);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const renderFileIcon = (cat: AttachedFile["category"]) => {
    switch (cat) {
      case "geojson":
        return <FileCode className="w-3.5 h-3.5 text-brand-teal" />;
      case "gis":
        return <Layers className="w-3.5 h-3.5 text-brand-blue" />;
      case "tabular":
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
      case "image":
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      case "pdf":
      case "doc":
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isTyping) return;
    
    // Stop recording if running
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentFiles = [...attachedFiles];
    const messageContent = input.trim() 
      ? input.trim() 
      : (language === "en" ? `[Attached files: ${currentFiles.map(f => f.name).join(", ")}]` : `[Fichiers transmis : ${currentFiles.map(f => f.name).join(", ")}]`);

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      attachments: currentFiles.length > 0 ? currentFiles : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages as any);
    setInput("");
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          activeZone,
          role,
          selectedLevers,
          resilienceIndex,
          language,
          attachments: currentFiles
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const err = new Error(data.error || "Service unavailable");
        (err as any).politeContent = data.content;
        throw err;
      }
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev: any) => [...prev, aiResponse] as any);
    } catch (err: any) {
      console.error("AI Assistant notice:", err);
      const isQuota = 
        err?.message?.includes("429") || 
        err?.message?.includes("quota") || 
        err?.message?.includes("RESOURCE_EXHAUSTED") ||
        err?.politeContent?.includes("Starter Tier");

      let politeFallback = "";
      if (isQuota) {
        if (language === "en") {
          politeFallback = "🌿 **Starter Tier Daily Notice**\n\nThank you very much for your interest and active engagement with FloodAtlas AI! Under the complimentary Starter Tier, today's AI analysis quota has currently been reached. We warmly invite you to continue your simulations and diagnostics a bit later or tomorrow.\n\nIn the meantime, your cartography, selected levers, and project data are safely preserved and remain interactive!";
        } else if (language === "de") {
          politeFallback = "🌿 **Starter-Tier Tageskontingent erreicht**\n\nVielen Dank für Ihre Arbeit mit FloodAtlas AI! Im Rahmen des kostenfreien Starter-Tiers wurde das tägliche KI-Kontingent vorübergehend erreicht. Wir laden Sie herzlich ein, Ihre Simulationen etwas später oder morgen fortzusetzen.\n\nAlle Ihre Karten, Hebel und Projektdaten bleiben sicher erhalten und nutzbar!";
        } else if (language === "ar") {
          politeFallback = "🌿 **تنويه باقة الوصول المجاني (Starter Tier)**\n\nشكراً جزيلاً لتفاعلكم القيم مع FloodAtlas AI! لقد تم الوصول إلى الحد اليومي لتحليلات الذكاء الاصطناعي حالياً. ندعوكم بكل سرور لمواصلة دراساتكم ومحاكاتكم في وقت لاحق أو غداً.\n\nفي هذه الأثناء، تظل خرائطكم ومعطيات مشروعكم محفوظة ومتاحة بالكامل!";
        } else {
          politeFallback = "🌿 **Information Quota Starter Tier**\n\nMerci beaucoup pour votre vif intérêt et vos échanges avec FloodAtlas AI ! Dans le cadre de l'accès gratuit Starter Tier, le quota journalier d'analyses IA a été atteint pour aujourd'hui. Nous vous invitons chaleureusement à poursuivre vos simulations et vos diagnostics un peu plus tard ou dès demain.\n\nToutes vos données, cartes et scénarios restent bien entendu sauvegardés et pleinement interactifs !";
        }
      } else {
        if (language === "en") {
          politeFallback = "🌿 **High Service Demand**\n\nThe AI service is momentarily experiencing high demand. Thank you very much for your patience; we kindly invite you to retry your query in a few moments.";
        } else if (language === "de") {
          politeFallback = "🌿 **Vorübergehende Dienstauslastung**\n\nDer KI-Dienst ist im Moment stark ausgelastet. Vielen Dank für Ihre Geduld; wir laden Sie ein, Ihre Anfrage gleich noch einmal zu stellen.";
        } else if (language === "ar") {
          politeFallback = "🌿 **انشغال مؤقت للخدمة**\n\nتشهد خدمة الذكاء الاصطناعي إقبالاً كبيراً في الوقت الحالي. نشكركم جزيلاً على صبركم، وندعوكم لتكرار طلبكم بعد بضع لحظات.";
        } else {
          politeFallback = "🌿 **Forte Affluence Momentanée**\n\nL'Assistant IA rencontre une forte affluence en ce moment. Nous vous remercions pour votre compréhension et vous invitons chaleureusement à renouveler votre demande dans quelques instants.";
        }
      }

      const politeMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: err?.politeContent || politeFallback,
        isQuotaNotice: isQuota,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev: any) => [...prev, politeMessage] as any);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderContent = (content: string, msgId?: string) => {
    if (msgId === "welcome") {
      const name = auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "Utilisateur";
      const zone = activeZone ? activeZone.split(",")[0] : (language === "en" ? "your territory" : "votre territoire");
      const userRole = role || (language === "en" ? "decision-maker" : "décideur");
      
      let personalizedGreeting = `👋 **Bienvenue ${name} !**\n\nVotre espace de travail pour **${zone}** est prêt. En tant que ${userRole}, votre rôle est essentiel pour adapter votre territoire face au dérèglement climatique.\n\nJe suis **Atlas**, votre allié stratégique et vigie territoriale. Je vais vous accompagner pour :\n- **Diagnostiquer** les zones vulnérables (inondations, crues, ruissellements, îlots de chaleur)\n- **Concevoir** des aménagements "Ville Éponge" (désimperméabilisation, noues végétalisées)\n- **Simuler** l'impact et évaluer les coûts (CAPEX/OPEX)\n\nPar quoi souhaitez-vous que l'on commence ? Vous pouvez me poser vos questions à la voix ou me joindre vos données SIG (.geojson), relevés pluviométriques (.csv) ou photos de terrain !`;
      
      if (language === "en") {
        personalizedGreeting = `👋 **Welcome ${name}!**\n\nYour workspace for **${zone}** is ready. As a ${userRole}, your role is essential in adapting your territory to climate change.\n\nI am **Atlas**, your strategic resilience ally and crisis co-pilot. I will assist you to:\n- **Diagnose** vulnerable areas (floods, runoff, heat islands)\n- **Design** "Sponge City" layouts (de-sealing, swales)\n- **Simulate** impact and evaluate costs (CAPEX/OPEX)\n\nWhat would you like to start with? Feel free to speak via microphone or attach your GIS files (.geojson), rainfall data (.csv) or site photos!`;
      }
      
      content = personalizedGreeting;
    }

    const textWithoutActionsAndSources = content.replace(/ACTION:[^\n]+/g, '').replace(/\*\*Sources:\*\*[\s\S]*?(?=\n\n|$)/, '').trim();
    const actions = [...content.matchAll(/ACTION:([a-z]+)/g)];
    const sourcesMatch = content.match(/\*\*Sources:\*\*([\s\S]*?)(?=\n\n|$)/);
    
    let sources: any[] = [];
    if (sourcesMatch) {
      const sourceLines = sourcesMatch[1].trim().split('\n');
      sources = sourceLines.map(line => {
        const m = line.match(/- \[(.*?)\]\((.*?)\)/);
        if (m) return { text: m[1], url: m[2] };
        return { text: line.replace('- ', ''), url: '#' };
      });
    }

    const isPoliteQuotaCard = content.startsWith("🌿") || content.includes("Starter Tier");

    return (
      <div className={`rounded-2xl p-6 mt-2 shadow-lg transition-all ${
        isPoliteQuotaCard 
          ? "bg-gradient-to-br from-[#122320]/90 to-[#101b2b]/90 border border-brand-teal/30 ring-1 ring-brand-teal/20" 
          : "bg-[#1a2133]/80 backdrop-blur-sm border border-white/10"
      }`}>
        {isPoliteQuotaCard && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-teal/20">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-teal/15 text-brand-teal rounded-full text-xs font-semibold">
              <span>🌿</span>
              <span>Information Starter Tier</span>
            </span>
            <span className="text-[11px] text-text-3 font-medium">Google AI Studio</span>
          </div>
        )}

        <div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed prose-headings:font-display prose-headings:font-semibold prose-headings:text-brand-teal prose-a:text-brand-blue prose-p:mb-4 prose-li:marker:text-brand-teal">
          <Markdown remarkPlugins={[remarkGfm]}>{textWithoutActionsAndSources}</Markdown>
        </div>

        {isPoliteQuotaCard && (
          <div className="mt-5 pt-4 border-t border-brand-teal/20 flex flex-wrap gap-2.5 items-center">
            <span className="text-xs text-text-3 font-medium mr-1">Vous pouvez continuer à explorer :</span>
            <button 
              onClick={() => navigate(`/project/${currentProjectId || 'default'}/map`)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-brand-teal text-text-1 text-xs font-medium transition-colors"
            >
              🗺️ Cartographie & Données
            </button>
            <button 
              onClick={() => navigate(`/project/${currentProjectId || 'default'}/scenarios`)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-brand-teal text-text-1 text-xs font-medium transition-colors"
            >
              💧 Simulation Scénarios
            </button>
            <button 
              onClick={() => navigate(`/project/${currentProjectId || 'default'}/reports`)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-brand-teal text-text-1 text-xs font-medium transition-colors"
            >
              📊 Note de Synthèse
            </button>
          </div>
        )}
        
        {sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-2">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] text-text-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                  <span>{s.text}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {actions.map((action, i) => {
              const actionType = action[1];
              return (
                <button 
                  key={i} 
                  className="px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-[12px] font-medium text-brand-blue hover:bg-brand-blue/20 transition-colors"
                  onClick={() => {
                    if (actionType === "analysis") navigate("/analysis");
                    if (actionType === "map") navigate("/map");
                    if (actionType === "report") navigate("/reports");
                    if (actionType === "scenario") navigate("/scenarios");
                  }}
                >
                  {actionType === "analysis" && "Run analysis →"}
                  {actionType === "map" && "View on map →"}
                  {actionType === "report" && "Generate report →"}
                  {actionType === "scenario" && "Simulate scenario →"}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full h-full bg-[#0B0F19] relative">
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col ">
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            {messages
              .filter((msg: any) => !msg.isHidden && !msg.content?.startsWith("Le client a cliqué"))
              .map((msg: any) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "user" ? (
                  <div className="bg-[#1E2638] border border-white/5 rounded-2xl rounded-tr-sm p-4 max-w-[85%] text-[14px] text-text-1 shadow-sm">
                    {/* Render message attachments if present */}
                    {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-white/10">
                        {msg.attachments.map((att: any) => (
                          <div 
                            key={att.id} 
                            className="flex items-center space-x-2 bg-void/70 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px]"
                          >
                            {att.previewUrl ? (
                              <img src={att.previewUrl} alt={att.name} className="w-6 h-6 rounded object-cover" />
                            ) : (
                              renderFileIcon(att.category)
                            )}
                            <span className="truncate max-w-[150px] font-medium text-text-1">{att.name}</span>
                            <span className="text-[10px] text-text-3 font-mono">
                              ({Math.round((att.size || 0) / 1024)} Ko)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.id === "welcome" ? msg.content.replace("Fabien", auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "User") : msg.content}
                  </div>
                ) : (
                  <div className="max-w-[95%] w-full">
                    {renderContent(msg.content, msg.id)}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                 <div className="max-w-[95%] w-full">
                    <div className="bg-[#1a2133] border border-white/10 rounded-xl p-5 mt-2 flex space-x-2 items-center">
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 pt-2 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col">
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {quickRequests.map((req, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setInput(req); }}
                    className="px-3 py-2 bg-[#1E2638]/80 hover:bg-[#1E2638] border border-white/5 rounded-xl text-[12px] text-text-2 hover:text-text-1 transition-colors text-left"
                  >
                    {req}
                  </button>
                ))}
              </div>
            )}

            {/* Speech error or feedback notice */}
            {speechNotice && (
              <div className="mb-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[12px] text-amber-300 flex items-center justify-between">
                <span>{speechNotice}</span>
                <button onClick={() => setSpeechNotice(null)} className="text-text-3 hover:text-white ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Live recording indicator */}
            {isRecording && (
              <div className="flex items-center space-x-2.5 mb-2.5 px-3.5 py-2 bg-red-500/15 border border-red-500/30 rounded-xl text-[12px] text-red-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="font-medium">
                  {language === "en" 
                    ? "Microphone listening... Speak naturally (click the mic button to finish)" 
                    : "Microphone actif : dictée en cours... Parlez naturellement"}
                </span>
                <button 
                  type="button"
                  onClick={toggleVoiceRecording} 
                  className="ml-auto px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 rounded text-[11px] font-semibold text-red-200 transition-colors"
                >
                  {language === "en" ? "Stop" : "Terminer"}
                </button>
              </div>
            )}

            {/* Attached files preview chips */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-2.5 p-2 bg-[#0E1524] border border-border rounded-xl">
                <div className="text-[11px] font-medium text-text-3 px-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Fichiers joints ({attachedFiles.length}) :</span>
                </div>
                {attachedFiles.map((f) => (
                  <div 
                    key={f.id} 
                    className="flex items-center space-x-2 bg-surface border border-white/10 rounded-lg pl-2 pr-1.5 py-1 text-[12px] text-text-1 hover:border-brand-teal/40 transition-colors"
                  >
                    {f.previewUrl ? (
                      <img src={f.previewUrl} alt={f.name} className="w-5 h-5 rounded object-cover" />
                    ) : (
                      renderFileIcon(f.category)
                    )}
                    <span className="max-w-[140px] truncate font-medium">{f.name}</span>
                    <span className="text-[10px] text-text-3 font-mono">{Math.round(f.size / 1024)} Ko</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-brand-teal/15 text-brand-teal font-semibold uppercase">
                      {f.category}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => removeAttachedFile(f.id)}
                      className="text-text-3 hover:text-brand-red p-0.5 rounded transition-colors ml-0.5"
                      title="Retirer le fichier"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden file input supporting GeoJSON, GIS, CSV, PDF, Images */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFilesSelected} 
              multiple 
              accept=".geojson,.json,.kml,.kmz,.zip,.shp,.csv,.tsv,.xlsx,.xls,.pdf,.txt,.md,.png,.jpg,.jpeg,.webp" 
              className="hidden" 
            />

            <div className="relative bg-[#131929] border border-white/10 rounded-2xl p-3 shadow-2xl transition-all focus-within:border-brand-blue/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording 
                    ? (language === "en" ? "Listening... Speak naturally to Atlas..." : "Écoute en cours... Votre voix s'inscrit ici...") 
                    : (language === "en" ? "Ask Atlas anything, dictate with mic or drop GIS / rainfall data..." : "Posez votre question à Atlas ou déposez un fichier SIG, GeoJSON, tableau pluviométrique...")
                }
                className="w-full bg-transparent border-none px-4 py-2 text-[15px] text-text-1 focus:outline-none resize-none h-[72px]"
              />
              <div className="flex justify-between items-center mt-2 px-2">
                <div className="flex items-center space-x-1">
                  {/* Attachment button */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative p-2 rounded-full transition-colors ${
                      attachedFiles.length > 0 
                        ? "text-brand-teal bg-brand-teal/15 border border-brand-teal/30" 
                        : "text-text-3 hover:text-text-1 hover:bg-white/5"
                    }`}
                    title="Joindre des fichiers SIG (GeoJSON, KML), tableaux de pluviométrie (CSV), études hydrauliques (PDF) ou photos"
                  >
                    <Paperclip className="w-[18px] h-[18px]" />
                    {attachedFiles.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-teal text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                        {attachedFiles.length}
                      </span>
                    )}
                  </button>

                  {/* Microphone voice button */}
                  <button 
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`relative p-2 rounded-full transition-all ${
                      isRecording 
                        ? "text-red-400 bg-red-500/20 border border-red-500/50 animate-pulse" 
                        : "text-text-3 hover:text-text-1 hover:bg-white/5"
                    }`}
                    title={isRecording ? "Arrêter la dictée vocale" : "Dicter votre demande à la voix"}
                  >
                    {isRecording ? (
                      <MicOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Mic className="w-[18px] h-[18px]" />
                    )}
                    {isRecording && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    )}
                  </button>

                  {attachedFiles.length > 0 && (
                    <span className="text-[11px] text-text-3 ml-2 hidden sm:inline">
                      {attachedFiles.length} fichier{attachedFiles.length > 1 ? "s" : ""} prêt{attachedFiles.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Send button */}
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e as any)}
                  className={`p-2.5 rounded-full transition-colors flex items-center justify-center w-10 h-10 ${
                    (input.trim() || attachedFiles.length > 0) && !isTyping 
                      ? "text-white bg-brand-blue hover:bg-brand-blue-dim shadow-md" 
                      : "text-white/30 bg-white/5 cursor-not-allowed"
                  }`}
                  disabled={(!input.trim() && attachedFiles.length === 0) || isTyping}
                  title="Envoyer la requête"
                >
                  <Send className="w-[18px] h-[18px] ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
