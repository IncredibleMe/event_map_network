// Μικρό wrapper για τα εικονίδια UI του Bootstrap Icons (ως SVG, χωρίς web font).
import search from 'bootstrap-icons/icons/search.svg?raw';
import plus from 'bootstrap-icons/icons/plus-lg.svg?raw';
import funnel from 'bootstrap-icons/icons/funnel-fill.svg?raw';
import chat from 'bootstrap-icons/icons/chat-dots-fill.svg?raw';
import info from 'bootstrap-icons/icons/info-circle-fill.svg?raw';
import geo from 'bootstrap-icons/icons/geo-alt-fill.svg?raw';
import calendar from 'bootstrap-icons/icons/calendar-event.svg?raw';
import bookmark from 'bootstrap-icons/icons/bookmark.svg?raw';
import bookmarkFill from 'bootstrap-icons/icons/bookmark-fill.svg?raw';
import check from 'bootstrap-icons/icons/check-lg.svg?raw';
import directions from 'bootstrap-icons/icons/sign-turn-right-fill.svg?raw';
import send from 'bootstrap-icons/icons/send-fill.svg?raw';
import clipboard from 'bootstrap-icons/icons/clipboard.svg?raw';
import map from 'bootstrap-icons/icons/map-fill.svg?raw';
import layers from 'bootstrap-icons/icons/layers-fill.svg?raw';

const ICONS = { search, plus, funnel, chat, info, geo, calendar, bookmark, bookmarkFill, check, directions, send, clipboard, map, layers };
export type IconName = keyof typeof ICONS;

function inner(svg: string): string {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
}

export default function Icon({ name, size = 16, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={`bi ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner(ICONS[name]) }}
    />
  );
}
