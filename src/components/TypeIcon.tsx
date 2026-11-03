import { EVENT_TYPES } from '../eventTypes';
import type { EventTypeId } from '../types';

export default function TypeIcon({ type, size = 16 }: { type: EventTypeId; size?: number }) {
  return (
    <svg
      className="type-icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: EVENT_TYPES[type].svg }}
    />
  );
}
