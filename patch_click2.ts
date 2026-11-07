import fs from 'fs';

let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const oldClick = `            setActiveFeature({
              name: name,
              type: details || address.country || "Zone analysée",
              lng,
              lat
            });`;

const newClick = `            setActiveFeature({
              name: name,
              type: details || address.country || "Zone analysée",
              lng,
              lat,
              displayName: data.display_name
            });`;

content = content.replace(oldClick, newClick);

const oldRender = `<span className="font-mono text-text-2 text-[10px]">{activeFeature.lat}, {activeFeature.lng}</span>
            </div>
          </div>`;

const newRender = `<span className="font-mono text-text-2 text-[10px]">{activeFeature.lat}, {activeFeature.lng}</span>
            </div>
            {activeFeature.displayName && (
              <div className="flex flex-col pt-2 mt-2 border-t border-border">
                <span className="text-text-3 text-[10px] mb-1 uppercase tracking-wider">Adresse complète</span>
                <span className="text-text-2 text-[11px] leading-snug">{activeFeature.displayName}</span>
              </div>
            )}
          </div>`;

content = content.replace(oldRender, newRender);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
