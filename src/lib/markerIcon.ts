import L from 'leaflet';
import { EVENT_TYPES } from '../eventTypes';
import type { EventTypeId } from '../types';

type PinState = 'normal' | 'selected' | 'draft';

const cache = new Map<string, L.DivIcon>();

/**
 * Πινέζα σε σχήμα πινακίδας: τετράγωνο στο χρώμα του τύπου με λευκό εικονίδιο (Bootstrap Icons)
 * και μύτη από κάτω. Το anchor είναι η άκρη της μύτης, ώστε να δείχνει ακριβώς το σημείο.
 */
export function pinIcon(type: EventTypeId, state: PinState = 'normal'): L.DivIcon {
  const key = `${type}|${state}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const t = EVENT_TYPES[type];
  const html = `
    <div class="pin pin--${state}" style="--pin:${t.color}">
      <svg viewBox="0 0 34 42" width="34" height="42" aria-hidden="true">
        <path class="pin-body" d="M5 1h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4h-7.5L17 41l-4.5-8H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4z"/>
        <g class="pin-glyph" transform="translate(8 8) scale(1.125)">${t.svg}</g>
      </svg>
    </div>`;

  const icon = L.divIcon({
    html,
    className: 'pin-wrap',
    iconSize: [34, 42],
    iconAnchor: [17, 41],
    tooltipAnchor: [0, -38],
  });
  cache.set(key, icon);
  return icon;
}

export function labelIcon(text: string, kind: 'city' | 'region'): L.DivIcon {
  return L.divIcon({
    html: kind === 'city' ? `<span class="city-dot"></span><span>${text}</span>` : `<span>${text}</span>`,
    className: `map-label map-label--${kind}`,
    iconSize: [0, 0],
  });
}
