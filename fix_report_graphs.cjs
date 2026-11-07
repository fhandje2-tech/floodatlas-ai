const fs = require('fs');

let file = fs.readFileSync('src/screens/ReportGenerator.tsx', 'utf8');

file = file.replace(
  'const [loadingStep, setLoadingStep] = useState(0);',
  'const [loadingStep, setLoadingStep] = useState(0);\n  const [includeGraphs, setIncludeGraphs] = useState(true);\n  const [includeMap, setIncludeMap] = useState(true);'
);

const oldSections = `          {/* Sections */}
          <div className="space-y-4">`;

const newSections = `          {/* Integrations */}
          <div className="space-y-4">
            <h3 className="text-[13px] font-semibold text-text-3 uppercase tracking-wider">Integrations</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input type="checkbox" checked={includeGraphs} onChange={(e) => setIncludeGraphs(e.target.checked)} className="mt-0.5 accent-brand-blue" />
                <div className="flex-1">
                  <span className="text-[13px] text-text-1 group-hover:text-brand-blue transition-colors">Territorial Analysis Graphs</span>
                  <p className="text-[11px] text-text-3 mt-0.5">Embed risk score breakdowns</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input type="checkbox" checked={includeMap} onChange={(e) => setIncludeMap(e.target.checked)} className="mt-0.5 accent-brand-blue" />
                <div className="flex-1">
                  <span className="text-[13px] text-text-1 group-hover:text-brand-blue transition-colors">Smart Mapping Visuals</span>
                  <p className="text-[11px] text-text-3 mt-0.5">Embed flood scenario maps</p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Sections */}
          <div className="space-y-4">`;

file = file.replace(oldSections, newSections);

fs.writeFileSync('src/screens/ReportGenerator.tsx', file);
