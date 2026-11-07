import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  BellRing, 
  CheckCheck, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  Layers, 
  MapPin, 
  ArrowRight, 
  X,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAgentStore, AppNotification } from "../../stores/agentStore";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "critical" | "simulation">("all");
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearNotifications,
    audioNotificationEnabled,
    setAudioNotificationEnabled,
    currentProjectId
  } = useAgentStore();

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalUnreadCount = notifications.filter(n => !n.read && (n.severity === "critical" || n.type === "critical_threshold")).length;

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === "critical") return n.severity === "critical" || n.type === "critical_threshold";
    if (filter === "simulation") return n.type === "simulation_ready" || n.severity === "success";
    return true;
  });

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenNotification = (n: AppNotification) => {
    markAsRead(n.id);
    setIsOpen(false);
    if (n.link) {
      // If the link uses a placeholder 'new', adapt to current project
      const finalLink = n.link.includes("/project/new/") && currentProjectId
        ? n.link.replace("/project/new/", `/project/${currentProjectId}/`)
        : n.link;
      navigate(finalLink);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 45) return "À l'instant";
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return "Hier";
      return `Il y a ${diffDays} j`;
    } catch {
      return "Récemment";
    }
  };

  const getNotificationIcon = (n: AppNotification) => {
    if (n.type === "critical_threshold" || n.severity === "critical") {
      return <ShieldAlert className="w-4 h-4 text-brand-red shrink-0" />;
    }
    if (n.type === "simulation_ready" || n.severity === "success") {
      return <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />;
    }
    if (n.severity === "warning") {
      return <AlertTriangle className="w-4 h-4 text-brand-amber shrink-0" />;
    }
    return <Layers className="w-4 h-4 text-brand-blue shrink-0" />;
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
          isOpen
            ? "bg-elevated border-brand-blue text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
            : unreadCount > 0
            ? "bg-surface/90 border-border text-text-1 hover:text-white hover:border-border-lit hover:bg-elevated"
            : "bg-surface/60 border-border/80 text-text-3 hover:text-text-1 hover:border-border hover:bg-elevated"
        }`}
        title={`Notifications (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})`}
        aria-label="Centre de notifications"
        aria-expanded={isOpen}
      >
        {criticalUnreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-brand-red animate-pulse" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {/* Counter Badge */}
        {unreadCount > 0 && (
          <span 
            className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full border border-void shadow-md transition-transform ${
              criticalUnreadCount > 0 
                ? "bg-brand-red animate-bounce" 
                : "bg-brand-blue"
            }`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Popover */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[380px] sm:w-[430px] max-w-[94vw] bg-[#0c1220]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 font-body">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-text-1 flex items-center gap-2">
                  <span>Centre d'Alertes</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-brand-blue/20 text-brand-blue border border-brand-blue/30">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-text-3">Surveillance des risques & simulations en direct</p>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setAudioNotificationEnabled(!audioNotificationEnabled)}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  audioNotificationEnabled
                    ? "bg-brand-teal/10 border-brand-teal/30 text-brand-teal hover:bg-brand-teal/20"
                    : "bg-void border-border text-text-3 hover:text-text-1"
                }`}
                title={audioNotificationEnabled ? "Sons d'alerte activés (cliquer pour désactiver)" : "Sons désactivés (cliquer pour activer)"}
              >
                {audioNotificationEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg bg-void border border-border text-text-2 hover:text-white hover:border-brand-blue/40 text-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="p-1.5 rounded-lg bg-void border border-border text-text-3 hover:text-brand-red hover:border-brand-red/40 text-xs transition-colors cursor-pointer"
                  title="Effacer toutes les notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-text-3 hover:text-white transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 bg-void/60 border-b border-white/5 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filter === "all"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-text-3 hover:text-text-2"
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("critical")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === "critical"
                  ? "bg-brand-red/20 text-brand-red border border-brand-red/30 font-semibold"
                  : "text-text-3 hover:text-brand-red"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              Seuils critiques ({notifications.filter(n => n.severity === "critical" || n.type === "critical_threshold").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("simulation")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === "simulation"
                  ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30 font-semibold"
                  : "text-text-3 hover:text-brand-teal"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              Simulations ({notifications.filter(n => n.type === "simulation_ready" || n.severity === "success").length})
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-text-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal/60" />
                </div>
                <p className="text-xs font-semibold text-text-2">Aucune alerte dans cette catégorie</p>
                <p className="text-[11px] text-text-3 max-w-[260px] leading-relaxed">
                  Toutes les simulations de risques et les seuils d'inondation sont à jour.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isCritical = notif.severity === "critical" || notif.type === "critical_threshold";
                const isSimReady = notif.type === "simulation_ready";

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleOpenNotification(notif)}
                    className={`group relative p-3 rounded-xl transition-all cursor-pointer border ${
                      !notif.read
                        ? isCritical
                          ? "bg-brand-red/10 border-brand-red/30 hover:bg-brand-red/15 hover:border-brand-red/50"
                          : "bg-brand-blue/10 border-brand-blue/30 hover:bg-brand-blue/15 hover:border-brand-blue/50"
                        : "bg-void/40 border-transparent hover:bg-surface hover:border-white/5"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon Container */}
                      <div className={`mt-0.5 p-2 rounded-lg border shrink-0 ${
                        isCritical
                          ? "bg-brand-red/20 border-brand-red/40 text-brand-red shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                          : isSimReady
                          ? "bg-brand-teal/20 border-brand-teal/40 text-brand-teal"
                          : "bg-surface border-border text-brand-blue"
                      }`}>
                        {getNotificationIcon(notif)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            isCritical
                              ? "bg-brand-red/20 text-brand-red border border-brand-red/30"
                              : isSimReady
                              ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
                              : "bg-brand-blue/20 text-brand-blue"
                          }`}>
                            {isCritical ? "Alerte Seuil Critique" : isSimReady ? "Simulation Prête" : "Information"}
                          </span>
                          <span className="text-[10px] font-mono text-text-3">
                            {formatRelativeTime(notif.timestamp)}
                          </span>
                        </div>

                        <h4 className={`text-xs font-semibold leading-tight line-clamp-1 ${
                          !notif.read ? "text-text-1 font-bold" : "text-text-2"
                        }`}>
                          {notif.title}
                        </h4>

                        <p className="text-[11px] text-text-3 mt-1 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>

                        {/* Zone tag & Action */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          {notif.zone ? (
                            <span className="inline-flex items-center text-[10px] text-text-3 bg-void px-2 py-0.5 rounded border border-white/5">
                              <MapPin className="w-2.5 h-2.5 mr-1 text-brand-teal" />
                              <span className="truncate max-w-[150px]">{notif.zone}</span>
                            </span>
                          ) : <span />}

                          <span className="inline-flex items-center text-[11px] font-medium text-brand-blue group-hover:text-white transition-colors">
                            <span>Consulter</span>
                            <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>

                      {/* Unread indicator dot & dismiss */}
                      <div className="absolute top-3 right-3 flex items-center space-x-1">
                        {!notif.read && (
                          <span 
                            className={`w-2 h-2 rounded-full ${
                              isCritical ? "bg-brand-red" : "bg-brand-blue"
                            }`} 
                            title="Non lu" 
                          />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-white text-text-3 transition-opacity"
                          title="Supprimer cette alerte"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-[11px] text-text-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              Veille hydrologique continue
            </span>
            {currentProjectId && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/project/${currentProjectId}/analysis`);
                }}
                className="text-brand-blue hover:text-white transition-colors font-medium cursor-pointer"
              >
                Lancer un diagnostic
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
