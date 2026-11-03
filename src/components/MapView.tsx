import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { GeoJSON, MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import type { BaseMap, EventTypeId, MapEvent } from '../types';
import { labelIcon, pinIcon } from '../lib/markerIcon';
import regionsData from '../data/greece-regions.json';
import neighborsData from '../data/neighbors.json';

const regions = regionsData as unknown as FeatureCollection;
const neighbors = neighborsData as unknown as FeatureCollection;

const GREECE_BOUNDS = L.latLngBounds([34.7, 19.3], [41.8, 28.3]);
const MAX_BOUNDS = L.latLngBounds([32.5, 15.5], [44.5, 32.5]);

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
const CARTO_ATTRIBUTION =
  OSM_ATTRIBUTION + ' &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>';

// Το κλειδί μπαίνει στο αρχείο .env ως VITE_CARTO_KEY (δες .env.example).
const CARTO_KEY = (import.meta.env.VITE_CARTO_KEY as string | undefined)?.trim();

interface TileSource {
  url: string;
  attribution: string;
  className?: string;
  maxNativeZoom: number;
  retina: boolean;
}

/** Με κλειδί CARTO: Voyager / Dark Matter. Χωρίς κλειδί: τα tiles του OpenStreetMap,
 *  με φίλτρο CSS για το σκοτεινό θέμα. */
function tileSource(dark: boolean): TileSource {
  if (CARTO_KEY) {
    const style = dark ? 'dark_all' : 'rastertiles/voyager';
    return {
      url: `https://basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY)}`,
      attribution: CARTO_ATTRIBUTION,
      maxNativeZoom: 20,
      retina: true,
    };
  }
  return {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM_ATTRIBUTION,
    className: dark ? 'tiles-dark' : undefined,
    maxNativeZoom: 19,
    retina: false,
  };
}

const CITIES: [string, number, number][] = [
  ['Αθήνα', 37.9838, 23.7275],
  ['Θεσσαλονίκη', 40.6401, 22.9444],
  ['Πάτρα', 38.2466, 21.7346],
  ['Ηράκλειο', 35.3387, 25.1442],
  ['Λάρισα', 39.639, 22.4191],
  ['Βόλος', 39.3622, 22.942],
  ['Ιωάννινα', 39.665, 20.8537],
  ['Χανιά', 35.5138, 24.018],
  ['Ρόδος', 36.4349, 28.2176],
  ['Καβάλα', 40.937, 24.4129],
  ['Καλαμάτα', 37.0389, 22.1142],
  ['Κέρκυρα', 39.6243, 19.9217],
  ['Μυτιλήνη', 39.1045, 26.555],
  ['Αλεξανδρούπολη', 40.8457, 25.8739],
  ['Σάμος', 37.7548, 26.977],
  ['Νάξος', 37.1036, 25.3763],
];

const REGION_LABELS: [string, number, number][] = [
  ['Ήπειρος', 39.55, 20.75],
  ['Δυτική Μακεδονία', 40.4, 21.45],
  ['Κεντρική Μακεδονία', 41.0, 23.2],
  ['Ανατ. Μακεδονία & Θράκη', 41.2, 25.3],
  ['Θεσσαλία', 39.45, 22.0],
  ['Στερεά Ελλάδα', 38.7, 22.75],
  ['Δυτική Ελλάδα', 38.6, 21.4],
  ['Πελοπόννησος', 37.45, 22.35],
  ['Αττική', 38.2, 23.75],
  ['Κρήτη', 35.15, 24.85],
  ['Νότιο Αιγαίο', 36.75, 25.75],
  ['Βόρειο Αιγαίο', 38.95, 25.7],
  ['Ιόνια Νησιά', 38.75, 20.15],
];

interface Props {
  events: MapEvent[];
  selectedId: string | null;
  baseMap: BaseMap;
  isDark: boolean;
  addMode: boolean;
  draft: { lat: number; lng: number } | null;
  draftType: EventTypeId;
  onSelect: (id: string) => void;
  onPick: (lat: number, lng: number) => void;
  onDraftMove: (lat: number, lng: number) => void;
  onTilesFailed: () => void;
}

export default function MapView(props: Props) {
  const { events, selectedId, baseMap, isDark, addMode, draft, draftType } = props;
  const tileHandlers = useTileWatchdog(props.onTilesFailed);
  const tiles = tileSource(isDark);

  return (
    <MapContainer
      bounds={GREECE_BOUNDS}
      maxBounds={MAX_BOUNDS}
      maxBoundsViscosity={0.8}
      minZoom={5}
      zoomSnap={0.25}
      zoomDelta={0.5}
      maxZoom={18}
      zoomControl={false}
      className={`map ${baseMap === 'regions' ? 'map--regions' : 'map--tiles'} ${addMode ? 'map--adding' : ''}`}
      attributionControl
    >
      <ZoomControl position="bottomleft" />
      <ZoomClass />

      {baseMap === 'tiles' ? (
        <TileLayer
          key={tiles.url + (tiles.className ?? '')}
          url={tiles.url}
          attribution={tiles.attribution}
          className={tiles.className}
          maxNativeZoom={tiles.maxNativeZoom}
          detectRetina={tiles.retina}
          eventHandlers={tileHandlers}
        />
      ) : (
        <RegionsBase />
      )}

      <MapClicks enabled={addMode} onPick={props.onPick} />
      <FlyToSelected events={events} selectedId={selectedId} />

      {events.map((e) => (
        <Marker
          key={e.id}
          position={[e.lat, e.lng]}
          icon={pinIcon(e.type, e.id === selectedId ? 'selected' : 'normal')}
          zIndexOffset={e.id === selectedId ? 1000 : 0}
          keyboard
          title={e.title}
          eventHandlers={{ click: () => props.onSelect(e.id) }}
        >
          <Tooltip direction="top" opacity={1} className="pin-tip">
            <strong>{e.title}</strong>
            <span>{e.city}</span>
          </Tooltip>
        </Marker>
      ))}

      {draft && (
        <Marker
          position={[draft.lat, draft.lng]}
          icon={pinIcon(draftType, 'draft')}
          draggable
          zIndexOffset={2000}
          eventHandlers={{
            dragend: (ev) => {
              const ll = (ev.target as L.Marker).getLatLng();
              props.onDraftMove(ll.lat, ll.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}

/** Αν τα tiles δεν φορτώνουν (offline ή μπλοκαρισμένα), περνάμε στο διανυσματικό υπόβαθρο. */
function useTileWatchdog(onFail: () => void) {
  const state = useRef({ ok: 0, err: 0, fired: false });
  return useMemo(
    () => ({
      tileload: () => {
        state.current.ok += 1;
      },
      tileerror: () => {
        const s = state.current;
        s.err += 1;
        if (!s.fired && s.ok === 0 && s.err >= 4) {
          s.fired = true;
          onFail();
        }
      },
    }),
    [onFail],
  );
}

function RegionsBase() {
  return (
    <>
      <GeoJSON data={neighbors} interactive={false} style={{ className: 'geo-neighbor', weight: 0.8, fillOpacity: 1 }} />
      <GeoJSON
        data={regions}
        attribution='Όρια: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>'
        style={{ className: 'geo-region', weight: 1, fillOpacity: 1 }}
      />
      {REGION_LABELS.map(([name, lat, lng]) => (
        <Marker key={name} position={[lat, lng]} icon={labelIcon(name, 'region')} interactive={false} keyboard={false} />
      ))}
      {CITIES.map(([name, lat, lng]) => (
        <Marker key={name} position={[lat, lng]} icon={labelIcon(name, 'city')} interactive={false} keyboard={false} />
      ))}
    </>
  );
}

function MapClicks({ enabled, onPick }: { enabled: boolean; onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (enabled) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Βάζει κλάση ανάλογα με το zoom, ώστε το CSS να δείχνει ονόματα περιφερειών ή πόλεων. */
function ZoomClass() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const apply = () => {
      const z = map.getZoom();
      el.dataset.zoom = z < 6 ? 'tiny' : z < 7 ? 'far' : z < 9 ? 'mid' : 'near';
    };
    apply();
    map.on('zoomend', apply);
    return () => {
      map.off('zoomend', apply);
    };
  }, [map]);
  return null;
}

function FlyToSelected({ events, selectedId }: { events: MapEvent[]; selectedId: string | null }) {
  const map = useMap();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === last.current) {
      last.current = selectedId;
      return;
    }
    last.current = selectedId;
    const ev = events.find((e) => e.id === selectedId);
    if (!ev) return;

    const zoom = Math.max(map.getZoom(), 9);
    const size = map.getSize();
    // Μετατοπίζουμε το κέντρο ώστε η πινέζα να μη κρύβεται πίσω από το panel.
    const offset = size.x >= 768 ? L.point(210, 0) : L.point(0, size.y * 0.3);
    const target = map.unproject(map.project([ev.lat, ev.lng], zoom).add(offset), zoom);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.flyTo(target, zoom, { animate: !reduce, duration: 0.8 });
  }, [selectedId, events, map]);

  return null;
}
