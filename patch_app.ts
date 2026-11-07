import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /<Route path="\/analysis".*<\/Route>/s,
  `<Route path="/project/:id">
            <Route path="analysis" element={<TerritoryAnalysis />} />
            <Route path="map" element={<SmartMapping />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="reports" element={<ReportGenerator />} />
            <Route path="scenarios" element={<ScenarioSimulation />} />
            <Route index element={<Navigate to="assistant" replace />} />
          </Route>`
);
fs.writeFileSync('src/App.tsx', content);
