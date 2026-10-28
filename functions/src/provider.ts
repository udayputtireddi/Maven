import { GoogleGenAI } from '@google/genai';
import { PERSONAS, GENERAL_PERSONA } from '../../constants';
import { HttpError } from './security.mjs';
export async function execute({ input }, signal: AbortSignal, emit: (text: string) => void) {
  const persona = [...PERSONAS, GENERAL_PERSONA].find(p => p.id === input.personaId);
  if (!persona) throw new HttpError(400, 'Unknown persona.');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const parts: any[] = input.attachments.map(a => ({ inlineData: { mimeType: a.mimeType, data: a.data } }));
  if (input.text) parts.push({ text: input.text });
  const contents = [...input.history.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts }];
  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash', contents,
    config: { systemInstruction: persona.systemInstruction, abortSignal: signal, maxOutputTokens: 4096 },
  });
  for await (const chunk of stream) if (chunk.text) emit(chunk.text);
}
