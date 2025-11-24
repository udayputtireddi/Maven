
import React, { useState, useRef, useEffect } from 'react';
import { IconSend, IconPaperclip, IconX } from './Icons';
import { Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  personaColor: string;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, personaColor }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setAttachments(prev => [...prev, {
          name: file.name,
          mimeType: file.type,
          data: base64Data
        }]);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; 
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustHeight();
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = (newHeight > 56 ? newHeight : 56) + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  return (
    <div className="w-full flex justify-center pointer-events-auto px-4 pb-6 pt-2">
      <div className="w-full max-w-4xl relative transition-all duration-300 ease-in-out">
        
        <div 
          className={`
            relative
            backdrop-blur-2xl
            rounded-[26px]
            transition-all duration-300
            flex flex-col
            overflow-hidden
            ring-1 ring-white/80
            ${isFocused 
              ? 'shadow-2xl border-transparent translate-y-[-2px] bg-white/90' 
              : 'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)] border-transparent bg-gradient-to-b from-white/80 to-white/90'
            }
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group flex items-center bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-1 py-1.5 text-xs font-medium text-[#425466] shadow-sm">
                  <span className="truncate max-w-[120px]">{att.name}</span>
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="ml-2 p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <IconX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-1 p-2 pl-3">
             <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-shrink-0 p-3 text-slate-400 hover:text-[#635bff] hover:bg-slate-100/50 rounded-xl transition-all mb-1"
              title="Attach file"
            >
              <IconPaperclip className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*,application/pdf,text/plain" 
            />

            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 py-4 px-2 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-[#0a2540] placeholder-slate-500/80 text-[16px] md:text-lg font-medium leading-relaxed min-h-[56px]"
              disabled={isLoading}
              style={{ outline: 'none', boxShadow: 'none', background: 'transparent' }}
            />

            <button
              onClick={handleSend}
              disabled={isLoading || (!text.trim() && attachments.length === 0)}
              className={`flex-shrink-0 p-3 mb-1 rounded-xl transition-all duration-200 flex items-center justify-center transform ${
                isLoading || (!text.trim() && attachments.length === 0)
                  ? 'bg-slate-100 text-slate-300'
                  : 'bg-[#0a2540] hover:bg-[#635bff] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                 <IconSend className="w-5 h-5 translate-x-0.5" />
              )}
            </button>
          </div>
        </div>
        
        <div className="text-center mt-3 transition-opacity duration-500">
           <p className="text-[10px] md:text-[11px] text-slate-500 font-medium tracking-wide">
             Maven AI can make mistakes. Check important info.
           </p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
