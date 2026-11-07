import React, { useEffect, useState } from "react";
import { NavLink } from "react-router"; // react-router 6
import { 
  LayoutGrid, 
  Home,
  Target, 
  Map as MapIcon, 
  Sparkles, 
  FileBarChart, 
  Waves, 
  Settings2, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", JSON.stringify(next));
  };

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/analysis", icon: Target, label: "Territory Analysis" },
    { to: "/map", icon: MapIcon, label: "Smart Mapping" },
    { to: "/assistant", icon: Sparkles, label: "AI Assistant" },
    { to: "/reports", icon: FileBarChart, label: "Reports" },
    { to: "/scenarios", icon: Waves, label: "Scenarios" },
  ];

  // Fetch user data directly here or get it from a global store. 
  // Let's just fetch it here for simplicity.
  const [userName, setUserName] = useState("Fabien Handje");
  const [userRole, setUserRole] = useState("Collectivité");

  useEffect(() => {
    import("../../services/firebase").then(({ auth, db }) => {
      import("firebase/firestore").then(({ doc, getDoc }) => {
        if (auth) auth.onAuthStateChanged(async (user) => {
          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserName(userSnap.data().name || user.displayName || "User");
              setUserRole(userSnap.data().role || "");
            }
          }
        });
      });
    });
  }, []);

  return (
    <aside 
      className={cn(
        "flex flex-col bg-surface border-r border-border transition-all duration-300",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Top Header */}
      <div className="h-14 flex items-center px-4 overflow-hidden border-b border-border/50 shrink-0">
        <Waves className="w-6 h-6 text-brand-blue shrink-0" />
        {!collapsed && (
          <div className="ml-3 flex items-start">
            <span className="font-display font-bold text-text-1 tracking-widest text-[15px]">FLOODATLAS</span>
            <span className="text-brand-teal font-bold ml-1 text-[9px] mt-0.5">AI</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2 mx-0 transition-colors group",
              isActive 
                ? "bg-elevated border-l-2 border-brand-teal text-text-1" 
                : "border-l-2 border-transparent text-text-2 hover:bg-surface hover:text-text-1"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="ml-3 text-[13px] font-medium truncate">{item.label}</span>}
          </NavLink>
        ))}

        <div className="my-4 px-4">
          <div className="h-px bg-border" />
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center px-4 py-2 mx-0 transition-colors group",
            isActive 
              ? "bg-elevated border-l-2 border-brand-teal text-text-1" 
              : "border-l-2 border-transparent text-text-2 hover:bg-surface hover:text-text-1"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings2 className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="ml-3 text-[13px] font-medium truncate">Settings</span>}
        </NavLink>

        <a
          href="#"
          className="flex items-center px-4 py-2 mx-0 transition-colors border-l-2 border-transparent text-text-2 hover:bg-surface hover:text-text-1"
          title={collapsed ? "Help" : undefined}
        >
          <HelpCircle className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="ml-3 text-[13px] font-medium truncate">Help</span>}
        </a>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border/50 flex items-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center text-brand-teal text-xs font-bold uppercase">
            {userName.substring(0, 2)}
          </div>
          <div className="ml-3 flex flex-col overflow-hidden">
            <span className="text-[13px] font-medium text-text-1 truncate">{userName}</span>
            <span className="text-[11px] text-text-3 truncate">{userRole}</span>
          </div>
          <div className="ml-auto px-1.5 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber text-[9px] font-bold">
            BETA
          </div>
        </div>
      )}

      {/* Toggle */}
      <button 
        onClick={toggle}
        className="h-10 flex items-center justify-center border-t border-border/50 text-text-3 hover:text-text-1 transition-colors hover:bg-elevated"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
