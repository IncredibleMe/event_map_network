import { useCallback, useEffect, useState } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { EVENT_TYPES } from '../eventTypes';
import type { MapEvent } from '../types';
import type { ChatService } from '../lib/chatService';
import { eventStatus, formatCoords, formatFullDate, formatWhen } from '../lib/format';
import TypeIcon from './TypeIcon';
import ChatTab from './ChatTab';
import Icon from './Icon';

interface Props {
  event: MapEvent | null;
  chat: ChatService;
  placement: 'end' | 'bottom';
  going: boolean;
  saved: boolean;
  onToggleGoing: () => void;
  onToggleSaved: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const STATUS_BG = { live: 'success', soon: 'warning', later: 'secondary', past: 'dark' } as const;

/** Το παράθυρο της εκδήλωσης: Bootstrap Offcanvas, χωρίς backdrop ώστε ο χάρτης να μένει ενεργός. */
export default function EventPanel(props: Props) {
  const { event, placement, onClose } = props;
  // Κρατάμε την τελευταία εκδήλωση ώστε το περιεχόμενο να μη χαθεί όσο κλείνει το offcanvas.
  const [shown, setShown] = useState<MapEvent | null>(event);
  useEffect(() => {
    if (event) setShown(event);
  }, [event]);

  return (
    <Offcanvas
      show={!!event}
      onHide={onClose}
      placement={placement}
      backdrop={false}
      scroll
      enforceFocus={false}
      className={`event-panel ${placement === 'bottom' ? 'event-panel--sheet' : ''}`}
      aria-labelledby="event-title"
    >
      {shown && <PanelContent {...props} event={shown} />}
    </Offcanvas>
  );
}

function PanelContent({ event, chat, going, saved, onToggleGoing, onToggleSaved, onDelete }: Props & { event: MapEvent }) {
  const [tab, setTab] = useState<string>('info');
  const [chatCount, setChatCount] = useState(() => chat.history(event.id).length);
  const [copied, setCopied] = useState(false);
  const type = EVENT_TYPES[event.type];
  const status = eventStatus(event.start, event.end);
  const goingCount = event.going + (going ? 1 : 0);

  useEffect(() => {
    setTab('info');
    setChatCount(chat.history(event.id).length);
    return chat.subscribe(event.id, (m) => setChatCount(m.length));
  }, [event.id, chat]);

  const onCount = useCallback((n: number) => setChatCount(n), []);

  const copyCoords = async () => {
    try {
      await navigator.clipboard.writeText(`${event.lat.toFixed(5)}, ${event.lng.toFixed(5)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.getElementById('coords-value');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`;
  const pct = event.capacity ? Math.min(100, Math.round((goingCount / event.capacity) * 100)) : 0;

  return (
    <>
      <Offcanvas.Header closeButton closeLabel="Κλείσιμο" className="align-items-start pb-2" style={{ ['--c' as string]: type.color }}>
        <div className="d-flex flex-column gap-1 me-2">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Badge className="type-badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: type.color }} bg="">
              <TypeIcon type={event.type} size={12} />
              {type.label}
            </Badge>
            <Badge bg={STATUS_BG[status.tone]} text={status.tone === 'soon' ? 'dark' : undefined}>
              {status.label}
            </Badge>
          </div>
          <Offcanvas.Title id="event-title" as="h2" className="h4 mb-0 mt-1">
            {event.title}
          </Offcanvas.Title>
          <div className="small">
            <div className="fw-semibold d-flex align-items-center gap-1">
              <Icon name="calendar" size={14} /> {formatWhen(event.start, event.end)}
            </div>
            <div className="text-body-secondary d-flex align-items-center gap-1">
              <Icon name="geo" size={14} /> {event.venue}, {event.city}
            </div>
          </div>
        </div>
      </Offcanvas.Header>

      <div className="px-3 pb-3 d-grid gap-2 event-actions">
        <Button variant={going ? 'success' : 'primary'} onClick={onToggleGoing} aria-pressed={going}>
          {going && <Icon name="check" className="me-1" />}
          Θα πάω
        </Button>
        <Button variant={saved ? 'secondary' : 'outline-secondary'} onClick={onToggleSaved} aria-pressed={saved}>
          <Icon name={saved ? 'bookmarkFill' : 'bookmark'} className="me-1" />
          {saved ? 'Αποθηκεύτηκε' : 'Αποθήκευση'}
        </Button>
        <Button variant="outline-secondary" href={directions} target="_blank" rel="noreferrer">
          <Icon name="directions" className="me-1" />
          Οδηγίες
        </Button>
      </div>

      <Offcanvas.Body className="pt-0 d-flex flex-column">
        <Tabs activeKey={tab} onSelect={(k) => setTab(k ?? 'info')} id="event-tabs" className="mb-3" mountOnEnter>
          <Tab
            eventKey="info"
            title={
              <span className="d-inline-flex align-items-center gap-1">
                <Icon name="info" size={14} /> Πληροφορίες
              </span>
            }
          >
            <p>{event.description}</p>

            <dl className="row small mb-3 facts">
              <dt className="col-4 text-body-secondary">Ημερομηνία</dt>
              <dd className="col-8">
                {formatFullDate(event.start)}
                {event.end && formatFullDate(event.end) !== formatFullDate(event.start) && <> έως {formatFullDate(event.end)}</>}
              </dd>

              <dt className="col-4 text-body-secondary">Χώρος</dt>
              <dd className="col-8">{event.venue}</dd>

              <dt className="col-4 text-body-secondary">Διοργανωτής</dt>
              <dd className="col-8">{event.organizer}</dd>

              <dt className="col-4 text-body-secondary">Είσοδος</dt>
              <dd className="col-8">{event.price}</dd>

              <dt className="col-4 text-body-secondary">Συμμετοχές</dt>
              <dd className="col-8">
                {event.capacity ? (
                  <>
                    {goingCount} από {event.capacity} θέσεις
                    <ProgressBar now={pct} className="mt-1" style={{ height: 6 }} variant="primary" aria-label={`Πληρότητα ${pct}%`} />
                  </>
                ) : (
                  <>{goingCount} δήλωσαν ότι θα πάνε</>
                )}
              </dd>

              <dt className="col-4 text-body-secondary">Συντεταγμένες</dt>
              <dd className="col-8">
                <span id="coords-value" className="font-monospace">
                  {formatCoords(event.lat, event.lng)}
                </span>
                <Button variant="link" size="sm" className="p-0 ms-2 align-baseline" onClick={copyCoords}>
                  <Icon name="clipboard" size={13} className="me-1" />
                  {copied ? 'Αντιγράφηκε' : 'Αντιγραφή'}
                </Button>
              </dd>
            </dl>

            {event.isSample && <p className="small text-body-secondary mb-2">Δείγμα δεδομένων για το πρωτότυπο.</p>}
            {event.createdByMe && (
              <Button variant="outline-danger" size="sm" onClick={onDelete}>
                Διαγραφή εκδήλωσης
              </Button>
            )}
          </Tab>

        </Tabs>
      </Offcanvas.Body>
    </>
  );
}
