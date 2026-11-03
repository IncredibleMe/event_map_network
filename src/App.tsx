import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Collapse from 'react-bootstrap/Collapse';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Icon from './components/Icon';
import MapView from './components/MapView';
import FilterBar from './components/FilterBar';
import EventPanel from './components/EventPanel';
import NewEventForm from './components/NewEventForm';
import { EVENT_TYPE_LIST } from './eventTypes';
import { SAMPLE_CHAT, SAMPLE_EVENTS } from './data/sampleEvents';
import { createLocalChatService } from './lib/chatService';
import { load, save } from './lib/storage';
import type { BaseMap, EventTypeId, MapEvent } from './types';

const ALL_TYPES = () => new Set<EventTypeId>(EVENT_TYPE_LIST.map((t) => t.id));

function useIsDark(): boolean {
  const read = () => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setDark(read());
    mq.addEventListener('change', update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      mq.removeEventListener('change', update);
      obs.disconnect();
    };
  }, []);
  return dark;
}

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return match;
}

export default function App() {
  const chat = useMemo(() => createLocalChatService(SAMPLE_CHAT), []);
  const isDark = useIsDark();
  const narrow = useMedia('(max-width: 767.98px)');

  // Το ύψος της μπάρας γίνεται μεταβλητή CSS, ώστε το παράθυρο εκδήλωσης να ανοίγει κάτω από αυτήν.
  const topbarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = topbarRef.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty('--topbar-h', `${el.getBoundingClientRect().bottom}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Το Bootstrap 5.3 αλλάζει θέμα με το data-bs-theme στο <html>.
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const [userEvents, setUserEvents] = useState<MapEvent[]>(() => load('userEvents', []));
  const [going, setGoing] = useState<Set<string>>(() => new Set(load<string[]>('going', [])));
  const [saved, setSaved] = useState<Set<string>>(() => new Set(load<string[]>('saved', [])));
  const [active, setActive] = useState<Set<EventTypeId>>(ALL_TYPES);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseMap, setBaseMap] = useState<BaseMap>('tiles');
  const [tilesFailed, setTilesFailed] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null);
  const [draftType, setDraftType] = useState<EventTypeId>('music');
  const [showFilters, setShowFilters] = useState<boolean>(() => load('showFilters', false));

  useEffect(() => save('userEvents', userEvents), [userEvents]);
  useEffect(() => save('going', [...going]), [going]);
  useEffect(() => save('saved', [...saved]), [saved]);
  useEffect(() => save('showFilters', showFilters), [showFilters]);

  const allEvents = useMemo(() => [...SAMPLE_EVENTS, ...userEvents], [userEvents]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('el');
    return allEvents.filter(
      (e) =>
        active.has(e.type) &&
        (!q || `${e.title} ${e.city} ${e.venue}`.toLocaleLowerCase('el').includes(q)),
    );
  }, [allEvents, active, query]);

  const selected = allEvents.find((e) => e.id === selectedId) ?? null;
  const filtered = active.size < EVENT_TYPE_LIST.length;

  // Άνοιγμα εκδήλωσης από τον σύνδεσμο, π.χ. ...#ev-samos-cyber
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && allEvents.some((e) => e.id === id)) setSelectedId(id);
    // μόνο στην πρώτη φόρτωση
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleType = (t: EventTypeId) =>
    setActive((prev) => {
      const next = new Set(prev);
      // Το πρώτο κλικ όταν όλα είναι ενεργά απομονώνει τον τύπο.
      if (prev.size === EVENT_TYPE_LIST.length) return new Set([t]);
      next.has(t) ? next.delete(t) : next.add(t);
      return next.size === 0 ? ALL_TYPES() : next;
    });

  const toggleIn = (setter: typeof setGoing, id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const startAdd = () => {
    setSelectedId(null);
    setDraft(null);
    setAddMode(true);
  };

  const cancelAdd = useCallback(() => {
    setAddMode(false);
    setDraft(null);
  }, []);

  const onPick = (lat: number, lng: number) => {
    setDraft({ lat, lng });
    setAddMode(false);
  };

  const onSaveEvent = (e: MapEvent) => {
    setUserEvents((prev) => [...prev, e]);
    setActive((prev) => new Set(prev).add(e.type));
    setDraft(null);
    setSelectedId(e.id);
  };

  const onDelete = (id: string) => {
    setUserEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedId(null);
  };

  const onTilesFailed = useCallback(() => {
    setTilesFailed(true);
    setBaseMap('regions');
    setFallbackNotice(true);
    window.setTimeout(() => setFallbackNotice(false), 6000);
  }, []);

  const closePanel = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    if (!addMode) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancelAdd();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addMode, cancelAdd]);

  return (
    <div className="app" lang="el">
      <Navbar ref={topbarRef} bg="dark" data-bs-theme="dark" className="topbar py-2" expand={false}>
        <div className="topbar-inner d-flex flex-wrap align-items-center w-100 gap-2 gap-md-3">
          <Navbar.Brand className="d-flex align-items-center gap-2 me-0">
            <svg className="brand-mark" viewBox="0 0 34 42" width="24" height="30" aria-hidden="true">
              <path d="M5 1h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4h-7.5L17 41l-4.5-8H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4z" />
              <path className="brand-mark-glyph" d="M9 11h16v3H9zm0 5.5h11v3H9zm0 5.5h7v3H9z" />
            </svg>
            <span className="d-flex flex-column lh-1">
              <span className="fw-bold fs-5">Χάρτης Εκδηλώσεων</span>
              <small className="text-white-50 brand-sub">
                {visible.length} από {allEvents.length} εκδηλώσεις στην Ελλάδα
              </small>
            </span>
          </Navbar.Brand>

          <Form className="search flex-grow-1" role="search" onSubmit={(e) => e.preventDefault()}>
            <InputGroup>
              <InputGroup.Text as="label" htmlFor="search">
                <Icon name="search" />
                <span className="visually-hidden">Αναζήτηση</span>
              </InputGroup.Text>
              <Form.Control
                id="search"
                type="search"
                placeholder="Αναζήτηση τίτλου ή πόλης"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </Form>

          <div className="d-flex align-items-center gap-2 ms-auto">
            <Button
              variant={showFilters ? 'light' : 'outline-light'}
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="filters"
            >
              <Icon name="funnel" className="me-1" />
              Φίλτρα
              {filtered && (
                <Badge bg="warning" text="dark" className="ms-1">
                  {active.size}
                </Badge>
              )}
            </Button>
            <ToggleButtonGroup type="radio" name="basemap" value={baseMap} onChange={(v: BaseMap) => setBaseMap(v)} aria-label="Υπόβαθρο χάρτη">
              <ToggleButton id="bm-tiles" value="tiles" variant="outline-light" disabled={tilesFailed}>
                <Icon name="map" className="me-1" />
                <span className="d-none d-sm-inline">Λεπτομερής</span>
              </ToggleButton>
              <ToggleButton id="bm-regions" value="regions" variant="outline-light">
                <Icon name="layers" className="me-1" />
                <span className="d-none d-sm-inline">Περιφέρειες</span>
              </ToggleButton>
            </ToggleButtonGroup>
            <Button variant={addMode ? 'outline-warning' : 'warning'} className="fw-bold" onClick={addMode ? cancelAdd : startAdd}>
              {!addMode && <Icon name="plus" className="me-1" />}
              {addMode ? 'Ακύρωση' : 'Νέα εκδήλωση'}
            </Button>
          </div>
        </div>
      </Navbar>

      <Collapse in={showFilters}>
        <div id="filters">
          <FilterBar events={allEvents} active={active} onToggle={toggleType} onReset={() => setActive(ALL_TYPES())} />
        </div>
      </Collapse>

      <main className="stage">
        <MapView
          events={visible}
          selectedId={selectedId}
          baseMap={baseMap}
          isDark={isDark}
          addMode={addMode}
          draft={draft}
          draftType={draftType}
          onSelect={(id) => {
            if (draft || addMode) return;
            setSelectedId(id);
          }}
          onPick={onPick}
          onDraftMove={(lat, lng) => setDraft({ lat, lng })}
          onTilesFailed={onTilesFailed}
        />

        <div className="map-notices">
          {addMode && (
            <Alert variant="dark" className="py-2 px-3 mb-0 shadow fw-semibold" role="status">
              Πάτησε στο σημείο του χάρτη όπου γίνεται η εκδήλωση.
            </Alert>
          )}
          {fallbackNotice && !addMode && !selected && !draft && (
            <Alert variant="light" className="py-2 px-3 mb-0 shadow-sm small border" role="status">
              Χωρίς σύνδεση με τον λεπτομερή χάρτη, εμφανίζονται οι περιφέρειες.
            </Alert>
          )}
          {visible.length === 0 && !addMode && (
            <Alert variant="light" className="py-2 px-3 mb-0 shadow-sm small border" role="status">
              Καμία εκδήλωση με αυτά τα φίλτρα.
            </Alert>
          )}
        </div>
      </main>

      <NewEventForm
        draft={draft}
        placement={narrow ? 'bottom' : 'end'}
        type={draftType}
        onTypeChange={setDraftType}
        onSave={onSaveEvent}
        onCancel={cancelAdd}
      />
      <EventPanel
        event={draft ? null : selected}
        chat={chat}
        placement={narrow ? 'bottom' : 'end'}
        going={!!selected && going.has(selected.id)}
        saved={!!selected && saved.has(selected.id)}
        onToggleGoing={() => selected && toggleIn(setGoing, selected.id)}
        onToggleSaved={() => selected && toggleIn(setSaved, selected.id)}
        onDelete={() => selected && onDelete(selected.id)}
        onClose={closePanel}
      />
    </div>
  );
}
