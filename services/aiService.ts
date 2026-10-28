import { aiFetch } from './aiClient';
import { getAIAuth } from './aiAuth';
import { PERSONAS, GENERAL_PERSONA } from '../constants';
import type { Attachment } from '../types';
let personaId = GENERAL_PERSONA.id;
let history: { role: 'user' | 'model'; text: string }[] = [];
let historyOwner = '';
export function initChatSession(systemInstruction: string) {
  personaId = [...PERSONAS, GENERAL_PERSONA].find(p => p.systemInstruction === systemInstruction)?.id || GENERAL_PERSONA.id;
  history = [];
  return true;
}
export async function sendMessageStream(text: string, attachments: Attachment[], onChunk: (text: string) => void): Promise<string> {
  const uid = getAIAuth().currentUser?.uid || '';
  if (uid !== historyOwner) { history = []; historyOwner = uid; }
  const response = await aiFetch('chat', { personaId, history: history.slice(-12), text, attachments });
  if (!response.body) throw new Error('No AI response stream.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '', full = '', done = false;
  function consume(line: string) {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.error) throw new Error(event.error);
    if (event.done === true) done = true;
    if (typeof event.text === 'string') { full += event.text; onChunk(full); }
  }
  try {
    while (true) {
      const chunk = await reader.read();
      pending += decoder.decode(chunk.value, { stream: !chunk.done });
      const lines = pending.split('\n'); pending = lines.pop() || '';
      lines.forEach(consume);
      if (chunk.done) break;
    }
    if (pending) consume(pending);
    if (!done) throw new Error('AI response was interrupted. Please retry.');
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  history.push({ role: 'user', text: text || '[Attachment]' }, { role: 'model', text: full.slice(0, 8000) });
  history = history.slice(-12);
  return full;
}
