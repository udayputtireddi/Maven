import { object, text, list, attachment, HttpError } from './security.mjs';
export function validate(body) {
  object(body, ['operation', 'input']);
  const { operation, input } = body;
  let cost = 1;

  if (operation !== 'chat') throw new HttpError(400, 'Unsupported AI operation.');
  object(input, ['personaId', 'history', 'text', 'attachments']);
  text(input.personaId, 80);
  if (!["career-coach", "swe-mentor", "product-manager", "data-analyst", "academic-researcher", "cyber-security", "travel-guide", "fitness-coach", "creative-writer", "general-maven"].includes(input.personaId)) throw new HttpError(400, "Unknown persona."); text(input.text, 8000, true);
  for (const message of list(input.history, 12)) {
    object(message, ['role', 'text']);
    if (!['user', 'model'].includes(message.role)) throw new HttpError(400, 'Invalid role.');
    text(message.text, 8000);
  }
  list(input.attachments, 2).forEach(attachment);
  if (!input.text?.trim() && !input.attachments.length) throw new HttpError(400, 'Empty message.');
  cost = 1 + input.attachments.length * 3;

  return { operation, input, cost, stream: operation === 'chat' };
}
