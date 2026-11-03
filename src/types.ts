export type EventTypeId =
  | 'music'
  | 'theatre'
  | 'sports'
  | 'art'
  | 'tech'
  | 'food'
  | 'festival'
  | 'volunteer';

export interface MapEvent {
  id: string;
  title: string;
  type: EventTypeId;
  lat: number;
  lng: number;
  venue: string;
  city: string;
  /** ISO 8601, ώρα Ελλάδας */
  start: string;
  end?: string;
  organizer: string;
  description: string;
  price: string;
  capacity?: number;
  going: number;
  /** true για τα δείγματα δεδομένων που συνοδεύουν το πρωτότυπο */
  isSample: boolean;
  createdByMe?: boolean;
}

export interface ChatMessage {
  id: string;
  eventId: string;
  author: string;
  text: string;
  at: string;
  clientId: string;
}

export type BaseMap = 'tiles' | 'regions';
