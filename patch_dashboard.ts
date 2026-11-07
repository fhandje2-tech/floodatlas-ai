import fs from 'fs';
let content = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

content = content.replace(
  'const modules = [',
  'const modules = [\n    { name: "Cartographie & Diagnostic IA", icon: MapIcon, desc: "SmartMapping", link: "map", color: "text-brand-blue" },\n    { name: "Génération de Rapports", icon: FileBarChart, desc: "Notes & Bilans", link: "reports", color: "text-text-1" }\n  ];\n  // '
);

content = content.replace(
  '<div className="flex space-x-2">\n                    <Link to={`/project/${project.id}/assistant`} onClick={() => setCurrentProject(project.id)}>\n                      <Button variant="secondary" size="sm" className="h-8 px-3 text-[12px] bg-void hover:bg-elevated">\n                        <Sparkles className="w-3 h-3 mr-1.5" /> IA\n                      </Button>\n                    </Link>\n                    <Link to={`/project/${project.id}/analysis`} onClick={() => setCurrentProject(project.id)}>\n                      <Button variant="secondary" size="sm" className="h-8 px-3 text-[12px] bg-void hover:bg-elevated">\n                        <Target className="w-3 h-3 mr-1.5" /> Diag\n                      </Button>\n                    </Link>\n                  </div>',
  '<div className="flex space-x-2">\n                    <Link to={`/project/${project.id}/map`} onClick={() => setCurrentProject(project.id)}>\n                      <Button variant="secondary" size="sm" className="h-8 px-3 text-[12px] bg-void hover:bg-elevated">\n                        <MapIcon className="w-3 h-3 mr-1.5" /> Ouvrir\n                      </Button>\n                    </Link>\n                  </div>'
);

fs.writeFileSync('src/screens/DashboardHome.tsx', content);
