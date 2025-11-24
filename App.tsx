import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import InputArea from './components/InputArea';
import { Persona, ChatMessage, Attachment, ChatSession } from './types';
import { PERSONAS, GENERAL_PERSONA } from './constants';
import { initChatSession, sendMessageStream } from './services/aiService';
import { saveSession, getSessions, deleteSession } from './services/storageService';
import { IconMenu } from './components/Icons';

const App: React.FC = () => {
  // Start with no persona selected (null)
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Only scroll if we have messages to prevent jumpiness
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  useEffect(() => {
    setSessions(getSessions());
    // Initialize session
    const instruction = currentPersona ? currentPersona.systemInstruction : GENERAL_PERSONA.systemInstruction;
    initChatSession(instruction);
  }, []);

  useEffect(() => {
    const instruction = currentPersona ? currentPersona.systemInstruction : GENERAL_PERSONA.systemInstruction;
    initChatSession(instruction);
  }, [currentPersona]);

  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg ? (firstUserMsg.text.slice(0, 40) + (firstUserMsg.text.length > 40 ? '...' : '')) : 'New Chat';
      
      const pId = currentPersona ? currentPersona.id : GENERAL_PERSONA.id;

      const session: ChatSession = {
        id: currentSessionId,
        personaId: pId,
        messages: messages,
        title: title,
        updatedAt: Date.now()
      };
      
      saveSession(session);
      setSessions(getSessions()); 
    }
  }, [messages, currentSessionId, currentPersona]);

  useEffect(() => {
    if (isLoading) {
       scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setMessages([]);
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
    setCurrentPersona(null); 
  };

  const handleSelectPersona = (persona: Persona) => {
    setCurrentPersona(persona);
    setMessages([]);
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
  };

  const handleLoadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    
    const savedPersona = PERSONAS.find(p => p.id === session.personaId);
    if (savedPersona) {
      setCurrentPersona(savedPersona);
    } else if (session.personaId === GENERAL_PERSONA.id) {
      setCurrentPersona(GENERAL_PERSONA);
    }
    
    setIsMobileSidebarOpen(false);
    if (window.innerWidth >= 768) {
        setIsDesktopSidebarCollapsed(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = deleteSession(id);
    setSessions(updated);
    if (id === currentSessionId) {
      handleNewChat();
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    let activePersona = currentPersona;
    if (!activePersona) {
      activePersona = GENERAL_PERSONA;
      setCurrentPersona(activePersona);
      
      if (!currentSessionId) {
         setCurrentSessionId(Date.now().toString());
      }
    }

    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text,
      attachments,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: modelMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      if (!currentPersona) {
         initChatSession(GENERAL_PERSONA.systemInstruction);
      }

      await sendMessageStream(text, attachments, (streamedText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMsgId ? { ...msg, text: streamedText } : msg
          )
        );
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMsgId
            ? { ...msg, text: "Sorry, I encountered an error processing your request.", isError: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAccentColor = () => {
     if (!currentPersona) return 'text-[#0a2540]';
     switch(currentPersona.id) {
      case 'swe-mentor': return 'text-purple-600';
      case 'creative-writer': return 'text-pink-600';
      case 'cyber-security': return 'text-red-600';
      case 'data-analyst': return 'text-emerald-600';
      case 'product-manager': return 'text-orange-600';
      case 'academic-researcher': return 'text-amber-700';
      case 'travel-guide': return 'text-teal-600';
      case 'fitness-coach': return 'text-lime-600';
      case 'career-coach': default: return 'text-[#635bff]';
    }
  };

  const BackgroundBlobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-200/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-pink-200/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-4000"></div>
    </div>
  );

  const isChatActive = messages.length > 0;

  return (
    <div className="flex h-[100dvh] font-sans overflow-hidden relative stripe-gradient-bg text-[#425466]">
      
      <Sidebar 
        currentPersona={currentPersona} 
        onSelectPersona={handleSelectPersona}
        onNewChat={handleNewChat}
        chatHistory={messages}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDesktopCollapsed={isDesktopSidebarCollapsed}
        onToggleDesktop={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
      />

      {/* Main Layout: Flex Column */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 transition-all duration-500">
        
        {/* Background */}
        <BackgroundBlobs />

        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 mt-2">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => {
                 if (window.innerWidth >= 768) {
                   setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
                 } else {
                   setIsMobileSidebarOpen(true);
                 }
               }} 
               className="p-2 -ml-2 text-slate-400 hover:text-[#0a2540] hover:bg-white/50 rounded-lg transition-all backdrop-blur-sm"
             >
               <IconMenu className="w-5 h-5" />
             </button>
           </div>
           {/* Current Persona Indicator */}
           {isChatActive && currentPersona && (
             <div className="flex items-center gap-2 text-xs font-semibold text-[#0a2540] bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm animate-fade-in">
                <span className={`w-2 h-2 rounded-full ${currentPersona.color}`}></span>
                {currentPersona.name}
             </div>
           )}
        </header>

        {/* Scrollable Content Area - Uses flex-1 and proper min-h-0 for Firefox/Safari flex nesting */}
        <div className="flex-1 overflow-y-auto min-h-0 relative w-full z-10 custom-scrollbar scroll-smooth">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col min-h-full">
            
            {/* Empty State: Centered Layout */}
            {!isChatActive && (
               <div className="flex-1 flex flex-col items-center justify-center pb-20 animate-fade-in">
                  <div className="w-full max-w-3xl mx-auto px-4 text-center">
                    <div className="mx-auto w-20 h-20 mb-8 bg-gradient-to-tr from-[#0a2540] to-[#635bff] rounded-[24px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 transform rotate-3 hover:rotate-6 transition-transform duration-500">
                       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#0a2540] mb-6">
                      Maven
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto mb-12 leading-relaxed">
                      Your personal council of experts. <br/>
                      <span className="text-[#635bff]">Architect your ideas.</span>
                    </p>
                    <div className="w-full transform transition-all duration-500 hover:scale-[1.01]">
                       <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} personaColor={getAccentColor()} />
                    </div>
                  </div>
               </div>
            )}

            {/* Active State: Messages List */}
            {isChatActive && (
              <div className="pt-4 pb-48 space-y-6">
                {messages.map((msg) => (
                  <MessageItem key={msg.id} message={msg} persona={currentPersona || GENERAL_PERSONA} />
                ))}
                
                {/* Loading Animation */}
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                  <div className="flex items-center gap-2 ml-4 mt-4 animate-fade-in opacity-50">
                      <div className="w-2 h-2 rounded-full bg-[#635bff] animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#635bff] animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#635bff] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer Input Area - Only when chat is active */}
        {isChatActive && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none md:pl-[280px] transition-all duration-500">
             <div className="w-full max-w-5xl mx-auto">
               <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} personaColor={getAccentColor()} />
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;