const fs = require('fs');

const code = `
import React, { useState, useRef, useEffect } from "react";
import { Send, Map as MapIcon, Target, FileBarChart, Waves, Sparkles, Image as ImageIcon } from "lucide-react";
import { useAgentStore } from "../stores/agentStore";
import { Link, useNavigate } from "react-router";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

export function AIAssistant({ isSplit }: { isSplit?: boolean }) {
  const { messages, setMessages, isTyping, setIsTyping, activeZone, zones } = useAgentStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages as any);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, activeZone })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch response");
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev: any) => [...prev, aiResponse] as any);
    } catch (err: any) {
      console.error(err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Error: " + err.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev: any) => [...prev, errorMsg] as any);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderContent = (content: string) => {
    const textWithoutActionsAndSources = content.replace(/ACTION:[^\\n]+/g, '').replace(/\\*\\*Sources:\\*\\*[\\s\\S]*?(?=\\n\\n|$)/, '').trim();
    const actions = [...content.matchAll(/ACTION:([a-z]+):(.*)/g)];
    const sourcesMatch = content.match(/\\*\\*Sources:\\*\\*([\\s\\S]*?)(?=\\n\\n|$)/);
    
    let sources: any[] = [];
    if (sourcesMatch) {
      const sourceLines = sourcesMatch[1].trim().split('\\n');
      sources = sourceLines.map(line => {
        const m = line.match(/- \\[(.*?)\\]\\((.*?)\\)/);
        if (m) return { text: m[1], url: m[2] };
        return { text: line.replace('- ', ''), url: '#' };
      });
    }

    return (
      <div className="bg-[#1a2133] border border-white/10 rounded-xl p-5 mt-2">
        <div className="prose prose-invert prose-sm max-w-none text-[14px] leading-relaxed">
          <Markdown remarkPlugins={[remarkGfm]}>{textWithoutActionsAndSources}</Markdown>
        </div>
        
        {sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-2">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] text-text-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                  <span>{s.text}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {actions.map((action, i) => {
              const actionType = action[1];
              return (
                <button 
                  key={i} 
                  className="px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-[12px] font-medium text-brand-blue hover:bg-brand-blue/20 transition-colors"
                  onClick={() => {
                    if (actionType === "analysis") navigate("/analysis");
                    if (actionType === "map") navigate("/map");
                    if (actionType === "report") navigate("/reports");
                    if (actionType === "scenario") navigate("/scenarios");
                  }}
                >
                  {actionType === "analysis" && "Run analysis →"}
                  {actionType === "map" && "View on map →"}
                  {actionType === "report" && "Generate report →"}
                  {actionType === "scenario" && "Simulate scenario →"}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full h-full bg-[#0B0F19] relative">
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col pb-36">
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            {messages.map((msg: any) => (
              <div key={msg.id} className={\`flex flex-col \${msg.role === "user" ? "items-end" : "items-start"}\`}>
                {msg.role === "user" ? (
                  <div className="bg-[#1E2638] border border-white/5 rounded-2xl rounded-tr-sm p-4 max-w-[85%] text-[14px] text-text-1 shadow-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[95%] w-full">
                    {renderContent(msg.content)}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                 <div className="max-w-[95%] w-full">
                    <div className="bg-[#1a2133] border border-white/10 rounded-xl p-5 mt-2 flex space-x-2 items-center">
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19] to-transparent">
          <div className="max-w-3xl mx-auto relative bg-[#131929] border border-white/10 rounded-2xl p-2 shadow-lg">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Axiha anything..."
              className="w-full bg-transparent border-none px-4 py-3 text-[14px] text-text-1 focus:outline-none resize-none h-[52px]"
            />
            <button 
              onClick={(e) => handleSubmit(e as any)}
              className="absolute right-4 top-4 text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
            
            <div className="flex justify-between items-center mt-2 px-2 pb-1">
              <div className="flex space-x-1">
                 <button onClick={() => navigate('/analysis')} className="p-2 text-brand-orange hover:bg-white/5 rounded-lg transition-colors tooltip-trigger" title="Territory Analysis">
                   <Target className="w-4 h-4" />
                 </button>
                 <button onClick={() => navigate('/map')} className="p-2 text-brand-blue hover:bg-white/5 rounded-lg transition-colors tooltip-trigger" title="Smart Mapping">
                   <MapIcon className="w-4 h-4" />
                 </button>
                 <button onClick={() => navigate('/reports')} className="p-2 text-brand-teal hover:bg-white/5 rounded-lg transition-colors tooltip-trigger" title="Reports">
                   <FileBarChart className="w-4 h-4" />
                 </button>
                 <button onClick={() => navigate('/scenarios')} className="p-2 text-brand-red hover:bg-white/5 rounded-lg transition-colors tooltip-trigger" title="Scenarios">
                   <Waves className="w-4 h-4" />
                 </button>
                 <button className="p-2 text-text-3 hover:bg-white/5 rounded-lg transition-colors tooltip-trigger" title="Add Image">
                   <ImageIcon className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/screens/AIAssistant.tsx', code);
