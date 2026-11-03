import type { EventTypeId } from './types';
// Εικονίδια από το Bootstrap Icons (https://icons.getbootstrap.com), φορτωμένα ως κείμενο SVG.
import music from 'bootstrap-icons/icons/music-note-beamed.svg?raw';
import theatre from 'bootstrap-icons/icons/ticket-perforated-fill.svg?raw';
import sports from 'bootstrap-icons/icons/trophy-fill.svg?raw';
import art from 'bootstrap-icons/icons/palette-fill.svg?raw';
import tech from 'bootstrap-icons/icons/laptop-fill.svg?raw';
import food from 'bootstrap-icons/icons/cup-hot-fill.svg?raw';
import festival from 'bootstrap-icons/icons/balloon-fill.svg?raw';
import volunteer from 'bootstrap-icons/icons/heart-fill.svg?raw';

export interface EventTypeDef {
  id: EventTypeId;
  label: string;
  color: string;
  /** Περιεχόμενο SVG (viewBox 0 0 16 16, fill=currentColor), για πινέζες, φίλτρα και φόρμα */
  svg: string;
}

/** Κρατά μόνο τα <path> μέσα από το <svg> του Bootstrap Icons. */
function inner(svg: string): string {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
}

export const EVENT_TYPES: Record<EventTypeId, EventTypeDef> = {
  music: { id: 'music', label: 'Συναυλία', color: '#c92a2a', svg: inner(music) },
  theatre: { id: 'theatre', label: 'Θέατρο & Σινεμά', color: '#6f42c1', svg: inner(theatre) },
  sports: { id: 'sports', label: 'Αθλητικό', color: '#2b8a3e', svg: inner(sports) },
  art: { id: 'art', label: 'Έκθεση & Τέχνες', color: '#0c8599', svg: inner(art) },
  tech: { id: 'tech', label: 'Συνέδριο & Τεχνολογία', color: '#1c5fd6', svg: inner(tech) },
  food: { id: 'food', label: 'Γαστρονομία', color: '#d9480f', svg: inner(food) },
  festival: { id: 'festival', label: 'Φεστιβάλ & Γιορτή', color: '#a87700', svg: inner(festival) },
  volunteer: { id: 'volunteer', label: 'Εθελοντισμός', color: '#d6336c', svg: inner(volunteer) },
};

export const EVENT_TYPE_LIST = Object.values(EVENT_TYPES);
