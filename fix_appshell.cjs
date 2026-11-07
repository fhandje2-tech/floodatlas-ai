const fs = require('fs');

let file = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
file = `
import React, { useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { useAgentStore } from "../../stores/agentStore";
import { X, Home, Plus, LayoutPanelLeft } from "lucide-react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AIAssistant } from "../../screens/AIAssistant";

export function AppShell() {
  const { setZones, setActiveZone, activeZone, setLanguage } = useAgentStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserContext = async () => {
      if (auth && auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.zones && Array.isArray(userData.zones)) {
            setZones(userData.zones);
            if (!activeZone && userData.zones.length > 0) {
              setActiveZone(userData.zones[0]);
            }
          }
          if (userData.language) {
            setLanguage(userData.language);
          }
        }
      }
    };
    fetchUserContext();
  }, [setZones, setActiveZone, activeZone, setLanguage]);

  const isDashboard = location.pathname === '/dashboard';
  const isSettings = location.pathname === '/settings';
  const isChatOnly = location.pathname === '/assistant' || location.pathname === '/';
  const isSplit = !isDashboard && !isSettings && !isChatOnly;

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0F19] text-text-1 overflow-hidden font-body">
      {/* Top Bar matching minimalist design */}
      <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-white/5">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-text-2 hover:text-white transition-colors flex items-center text-sm font-medium">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <button className="text-brand-orange hover:text-brand-orange-dim transition-colors flex items-center text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            New project
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-semibold text-text-2 transition-colors">
            <LayoutPanelLeft className="w-3.5 h-3.5 mr-2" />
            SPLIT
          </button>
          <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-xs font-bold">
            FH
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        {isDashboard || isSettings ? (
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        ) : (
          <>
            <div className={\`flex flex-col transition-all duration-300 \${isSplit ? 'w-[450px] border-r border-white/5 bg-[#0e131f]' : 'w-full max-w-4xl mx-auto'}\`}>
              <AIAssistant isSplit={isSplit} />
            </div>
            {isSplit && (
              <div className="flex-1 overflow-y-auto relative bg-[#090c14]">
                <Outlet />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
`;
fs.writeFileSync('src/components/layout/AppShell.tsx', file);

