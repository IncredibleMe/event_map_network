import type { ChatMessage } from '../types';

/**
 * Το UI μιλάει μόνο με αυτό το interface. Σήμερα η υλοποίηση είναι τοπική
 * (BroadcastChannel ανάμεσα σε καρτέλες του ίδιου browser). Στο επόμενο βήμα
 * γράφουμε createSocketChatService() με Socket.IO και δεν αλλάζει τίποτα στα components.
 */
export interface ChatService {
  clientId: string;
  history(eventId: string): ChatMessage[];
  send(eventId: string, author: string, text: string): ChatMessage;
  subscribe(eventId: string, listener: (messages: ChatMessage[]) => void): () => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createLocalChatService(seed: ChatMessage[]): ChatService {
  const clientId = uid();
  const store = new Map<string, ChatMessage[]>();
  const listeners = new Map<string, Set<(m: ChatMessage[]) => void>>();

  for (const m of seed) {
    const list = store.get(m.eventId) ?? [];
    list.push(m);
    store.set(m.eventId, list);
  }

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel('greece-events-chat');
  } catch {
    channel = null;
  }

  const notify = (eventId: string) => {
    const list = store.get(eventId) ?? [];
    listeners.get(eventId)?.forEach((fn) => fn([...list]));
  };

  const append = (m: ChatMessage) => {
    const list = store.get(m.eventId) ?? [];
    if (list.some((x) => x.id === m.id)) return;
    list.push(m);
    store.set(m.eventId, list);
    notify(m.eventId);
  };

  channel?.addEventListener('message', (ev: MessageEvent<ChatMessage>) => {
    if (ev.data && ev.data.eventId) append(ev.data);
  });

  return {
    clientId,
    history: (eventId) => [...(store.get(eventId) ?? [])],
    send(eventId, author, text) {
      const m: ChatMessage = { id: uid(), eventId, author, text, at: new Date().toISOString(), clientId };
      append(m);
      try {
        channel?.postMessage(m);
      } catch {
        /* άλλες καρτέλες δεν θα το δουν, το μήνυμα μένει τοπικά */
      }
      return m;
    },
    subscribe(eventId, listener) {
      const set = listeners.get(eventId) ?? new Set();
      set.add(listener);
      listeners.set(eventId, set);
      return () => set.delete(listener);
    },
  };
}
