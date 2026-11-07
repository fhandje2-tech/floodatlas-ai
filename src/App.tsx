import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LaunchScreen } from "./screens/LaunchScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { DashboardHome } from "./screens/DashboardHome";
import { AppShell } from "./components/layout/AppShell";
import { TerritoryAnalysis } from "./screens/TerritoryAnalysis";
import { SmartMapping } from "./screens/SmartMapping";
import { AIAssistant } from "./screens/AIAssistant";
import { ReportGenerator } from "./screens/ReportGenerator";
import { ScenarioSimulation } from "./screens/ScenarioSimulation";
import { Settings } from "./screens/Settings";
import { NewProjectScreen } from "./screens/NewProjectScreen";

import { initFirebaseSync } from "./lib/sync";

initFirebaseSync();

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LaunchScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        
        {/* App Shell Routes */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/new-project" element={<NewProjectScreen />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/project/:id">
            <Route path="analysis" element={<TerritoryAnalysis />} />
            <Route path="map" element={<SmartMapping />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="reports" element={<ReportGenerator />} />
            <Route path="scenarios" element={<ScenarioSimulation />} />
            <Route index element={<Navigate to="assistant" replace />} />
          </Route>
        
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
