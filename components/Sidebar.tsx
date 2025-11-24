
import React from 'react';
import { Persona, ChatMessage, ChatSession } from '../types';
import { PERSONAS } from '../constants';
import { getIcon, IconDownload, IconX } from './Icons';

interface SidebarProps {
  currentPersona: Persona | null;
  onSelectPersona: (persona: Persona) => void;
  onNewChat: () => void;
  chatHistory: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  onLoadSession: (session: ChatSession) => void;
  onDeleteSession: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDesktopCollapsed: boolean;
  onToggleDesktop: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPersona, 
  onSelectPersona, 
  onNewChat,
  chatHistory, 
  sessions,
  currentSessionId,
  onLoadSession,
  onDeleteSession,
  isMobileOpen, 
  onCloseMobile,
  isDesktopCollapsed,
  onToggleDesktop
}) => {
  
  const handleExport = () => {
    if (!currentPersona) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatHistory, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `chat-history-${currentPersona.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Blended sidebar: Highly transparent with blur to merge with the background
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
    ${isMobileOpen ? 'translate-x-0 w-80 shadow-2xl' : '-translate-x-full w-80'} 
    md:translate-x-0 md:relative md:shadow-none
    ${isDesktopCollapsed ? 'md:w-0 md:overflow-hidden opacity-0 md:opacity-0 pointer-events-none' : 'md:w-[280px] opacity-100'}
    bg-white/40 backdrop-blur-xl border-r border-white/20
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-5 flex justify-between items-center">
           {/* Brand / Collapse Toggle */}
           <div className="flex items-center gap-3 text-[#0a2540] font-bold text-lg tracking-tight cursor-pointer group" onClick={onToggleDesktop}>
            <div className="w-8 h-8 bg-[#0a2540] rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-500/20 group-hover:scale-105 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span className="opacity-90">Maven</span>
           </div>
          <button onClick={onCloseMobile} className="md:hidden text-slate-500 hover:text-slate-800 p-1">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 hide-scrollbar">
          
          {/* New Thread Button */}
          <button 
             onClick={onNewChat}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/90 border border-white/40 shadow-sm hover:shadow-md text-[#0a2540] rounded-xl transition-all duration-300 group"
          >
             <div className="p-1 rounded-full bg-[#0a2540]/5 group-hover:bg-[#635bff] group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
             </div>
             <span className="text-sm font-semibold">New Thread</span>
          </button>
          
          {/* Personas Section */}
          <div>
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personas</span>
            </div>
            <div className="space-y-1">
              {PERSONAS.map((persona) => {
                const isActive = currentPersona?.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      onSelectPersona(persona);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-left group relative ${
                      isActive
                        ? 'bg-white/60 shadow-sm text-[#0a2540] font-semibold ring-1 ring-black/5'
                        : 'hover:bg-white/30 text-slate-600 hover:text-[#0a2540]'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md mr-3 transition-all duration-300 ${isActive ? 'scale-110 text-[#635bff] bg-[#635bff]/10' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {getIcon(persona.icon, `w-4 h-4 ${isActive ? 'animate-gentle-bounce' : ''}`)}
                    </div>
                    <div className="truncate text-[13px]">{persona.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* History Section */}
          {sessions.length > 0 && (
            <div>
              <div className="px-3 pb-2 flex items-center justify-between mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent</span>
              </div>
              <div className="space-y-0.5">
                {sessions.map((session) => (
                  <div key={session.id} className="group relative flex items-center">
                    <button
                      onClick={() => {
                        onLoadSession(session);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-left pr-8 ${
                        currentSessionId === session.id
                          ? 'bg-white/40 text-[#0a2540] font-medium'
                          : 'hover:bg-white/20 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                       <div className="truncate text-[13px] opacity-90">{session.title}</div>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="absolute right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleExport}
            disabled={chatHistory.length === 0}
            className="flex items-center justify-center w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-[#0a2540] hover:bg-white/50 rounded-lg transition-all disabled:opacity-50"
          >
            <IconDownload className="w-3.5 h-3.5 mr-2" />
            Export Data
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
