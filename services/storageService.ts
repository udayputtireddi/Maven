import { ChatSession } from '../types';

const STORAGE_KEY = 'expert_box_sessions';

export const getSessions = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse sessions", e);
    return [];
  }
};

export const saveSession = (session: ChatSession) => {
  try {
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      // Update existing
      sessions[index] = session;
      // Move to top
      const updated = sessions.splice(index, 1)[0];
      sessions.unshift(updated);
    } else {
      // Add new
      sessions.unshift(session);
    }
    
    // Limit to 50 sessions
    if (sessions.length > 50) {
      sessions.length = 50;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const deleteSession = (id: string) => {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
};

export const clearAllSessions = () => {
  localStorage.removeItem(STORAGE_KEY);
};
