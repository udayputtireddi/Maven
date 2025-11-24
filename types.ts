export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  icon: string; // SVG path data or emoji
  color: string;
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 encoded data
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: Attachment[];
  isError?: boolean;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  personaId: string;
  messages: ChatMessage[];
  title: string;
  updatedAt: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
}