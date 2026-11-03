import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { EVENT_TYPE_LIST } from '../eventTypes';
import type { EventTypeId, MapEvent } from '../types';
import TypeIcon from './TypeIcon';

interface Props {
  events: MapEvent[];
  active: Set<EventTypeId>;
  onToggle: (t: EventTypeId) => void;
  onReset: () => void;
}

export default function FilterBar({ events, active, onToggle, onReset }: Props) {
  // const counts = new Map<EventTypeId, number>();
  // for (const e of events) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
  // const allOn = active.size === EVENT_TYPE_LIST.length;

  // return (
  //   <div className="filters border-bottom bg-body" role="group" aria-label="Φίλτρα τύπου εκδήλωσης">
  //     <Button size="sm" variant={allOn ? 'primary' : 'outline-secondary'} onClick={onReset} aria-pressed={allOn}>
  //       Όλα
  //     </Button>
  //     {EVENT_TYPE_LIST.map((t) => {
  //       const on = active.has(t.id) && !allOn;
  //       return (
  //         <Button
  //           key={t.id}
  //           size="sm"
  //           variant="outline-secondary"
  //           className={`type-filter ${on ? 'is-on' : ''} ${active.has(t.id) ? '' : 'is-off'}`}
  //           style={{ ['--c' as string]: t.color }}
  //           onClick={() => onToggle(t.id)}
  //           aria-pressed={active.has(t.id)}
  //         >
  //           <span className="type-filter-icon">
  //             <TypeIcon type={t.id} size={13} />
  //           </span>
  //           {t.label}
  //           <Badge bg="secondary" className="ms-1" pill={false}>
  //             {counts.get(t.id) ?? 0}
  //           </Badge>
  //         </Button>
  //       );
  //     })}
  //   </div>
  // );
}
