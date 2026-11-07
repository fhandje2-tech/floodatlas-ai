import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /<Markdown>\{msg\.content\}<\/Markdown>\n\s*<\/div>\n\s*<\/div>/;

const replacement = `<Markdown>{msg.content}</Markdown>
                      {msg.role === 'ai' && (
                        <div className="mt-2 flex justify-end">
                          <button onClick={() => navigator.clipboard.writeText(msg.content)} className="text-[10px] uppercase font-bold text-brand-teal/80 hover:text-brand-teal flex items-center transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copier
                          </button>
                        </div>
                      )}
                    </div>
                  </div>`;
content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Message UI patched");
