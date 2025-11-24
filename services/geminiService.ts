import { GoogleGenAI, Chat, GenerativeModel } from "@google/genai";
import { MODEL_NAME } from "../constants";
import { Attachment } from "../types";

let chatSession: Chat | null = null;
let currentModel: GenerativeModel | null = null;

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const initChatSession = (systemInstruction: string) => {
  try {
    // Create a new chat session with the specific system instruction for the persona
    chatSession = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to initialize chat session:", error);
    return false;
  }
};

export const sendMessageStream = async (
  text: string,
  attachments: Attachment[],
  onChunk: (text: string) => void
): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized.");
  }

  let fullResponse = "";

  try {
    // Construct content parts
    const parts: any[] = [];
    
    // Add attachments first (images/files)
    if (attachments && attachments.length > 0) {
      attachments.forEach((att) => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data,
          },
        });
      });
    }

    // Add text prompt
    if (text) {
      parts.push({ text: text });
    }

    // If we only have text, we can send just the string, but for consistency with attachments we use the parts array usually.
    // However, the SDK's Chat.sendMessageStream expects a generic message structure.
    // It handles string or ContentPart[].
    const messagePayload = parts.length === 1 && parts[0].text ? parts[0].text : parts;

    const result = await chatSession.sendMessageStream({ message: messagePayload });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullResponse += chunkText;
        onChunk(fullResponse);
      }
    }

    return fullResponse;

  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
