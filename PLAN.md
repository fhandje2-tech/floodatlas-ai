# Implementation Plan

1. **Part A: Project-Scoped State**
   - Files: `src/stores/agentStore.ts`, `src/App.tsx`, `src/components/layout/AppShell.tsx`, `src/components/layout/TopBar.tsx`, `src/screens/DashboardHome.tsx`, `src/screens/AIAssistant.tsx`, `src/screens/TerritoryAnalysis.tsx`, `src/screens/SmartMapping.tsx`, `src/screens/ScenarioSimulation.tsx`, `src/screens/ReportGenerator.tsx`
   - Actions: Update Zustand store to support multiple projects. Add project CRUD. Update router and screens to use `currentProject`.

2. **Part B: Unified Language Source of Truth**
   - Files: `src/stores/agentStore.ts`, `server.ts`, `src/screens/AIAssistant.tsx`, `src/i18n.ts` (if any), `src/components/layout/AppShell.tsx`.
   - Actions: Sync `agentStore.language` with `i18next`. Dynamically generate the welcome message based on language. Pass language explicitly to the Gemini API.

3. **Part C: AI Assistant Layout**
   - Files: `src/screens/AIAssistant.tsx`.
   - Actions: Fix layout so results aren't hidden behind the input bar (adjust padding/margins).

4. **Part D: Diagnostic Pre-Launch Calibration**
   - Files: `src/screens/TerritoryAnalysis.tsx`.
   - Actions: Add a pre-launch form to refine scope before running the diagnostic. Add a button to route results to the Assistant.

5. **Part E: Cartographie Multi-Provider Maps**
   - Files: `src/screens/SmartMapping.tsx`.
   - Actions: Create a map provider abstraction (MapLibre, Mapbox, Leaflet). Add layer toggles based on user profile. Allow navigation within results.

6. **Part F: Reports Multi-Type Document Generation**
   - Files: `src/screens/ReportGenerator.tsx`.
   - Actions: Expand to generate financial, technical, and urbanistic reports using project state.

7. **Part G: Scenario Visualization / Image Gen**
   - Files: `src/screens/ScenarioSimulation.tsx`, `server.ts`.
   - Actions: Add a button to generate an image visualization of the selected scenario via Gemini. Add backend endpoint.
