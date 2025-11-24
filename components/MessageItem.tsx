import React from 'react';
import { ChatMessage, Persona } from '../types';
import { getIcon, IconUser } from './Icons';
import { parse } from 'marked';

interface MessageItemProps {
  message: ChatMessage;
  persona: Persona;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, persona }) => {
  const isUser = message.role === 'user';

  const contentHtml = !isUser 
    ? (parse(message.text) as string) 
    : null;

  return (
    <div className={`group w-full mb-8 animate-slide-up ${isUser ? 'flex justify-end' : ''}`}>
      <div className={`flex gap-4 md:gap-6 max-w-[95%] lg:max-w-[90%] ${isUser ? 'flex-row-reverse' : ''}`}>
        
        {/* Icon Column */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm border ${
            isUser ? 'bg-[#0a2540] text-white border-[#0a2540]' : 'bg-white border-slate-200 text-[#635bff]'
          }`}>
            {isUser ? (
              <IconUser className="w-5 h-5" />
            ) : (
              <div className="text-[#635bff]">
                 {getIcon(persona.icon, 'w-5 h-5')}
              </div>
            )}
          </div>
        </div>

        {/* Content Column */}
        <div className={`flex-1 min-w-0 overflow-hidden ${isUser ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : ''}`}>
             <span className="font-bold text-xs text-slate-400 uppercase tracking-widest">
               {isUser ? 'You' : persona.name}
             </span>
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`mb-3 flex flex-wrap gap-3 ${isUser ? 'justify-end' : ''}`}>
              {message.attachments.map((att, idx) => (
                 <div key={idx} className="relative group/att rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-transform hover:scale-[1.01]">
                    {att.mimeType.startsWith('image/') ? (
                      <img 
                        src={`data:${att.mimeType};base64,${att.data}`} 
                        alt={att.name} 
                        className="h-40 md:h-48 w-auto object-cover"
                      />
                    ) : (
                      <div className="h-14 px-5 flex items-center justify-center text-sm text-[#0a2540] font-medium bg-[#f6f9fc]">
                        <span className="truncate max-w-[200px]">{att.name}</span>
                      </div>
                    )}
                 </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          {isUser ? (
            <div className="inline-block text-left bg-[#635bff] text-white px-6 py-4 rounded-2xl rounded-tr-sm shadow-lg shadow-indigo-500/20 text-lg leading-relaxed font-medium">
              {message.text}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm border border-white/50 px-0 py-2 rounded-none shadow-none">
              <div 
                className="prose prose-lg max-w-none leading-relaxed text-[#425466] prose-headings:font-bold prose-headings:text-[#0a2540] prose-a:text-[#635bff] prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-[#0a2540] prose-code:text-[#635bff] prose-code:bg-[#f6f9fc] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-semibold prose-pre:bg-[#0a2540] prose-pre:text-slate-200 prose-pre:shadow-xl prose-li:marker:text-[#635bff]"
                dangerouslySetInnerHTML={{ __html: contentHtml || '' }}
              />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default MessageItem;