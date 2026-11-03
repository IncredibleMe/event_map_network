import { useState } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { EVENT_TYPE_LIST } from '../eventTypes';
import type { EventTypeId, MapEvent } from '../types';
import { formatCoords } from '../lib/format';
import TypeIcon from './TypeIcon';

interface Props {
  draft: { lat: number; lng: number } | null;
  placement: 'end' | 'bottom';
  type: EventTypeId;
  onTypeChange: (t: EventTypeId) => void;
  onSave: (e: MapEvent) => void;
  onCancel: () => void;
}

function nextSaturdayEvening(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T19:00`;
}

export default function NewEventForm({ draft, placement, ...rest }: Props) {
  return (
    <Offcanvas
      show={!!draft}
      onHide={rest.onCancel}
      placement={placement}
      backdrop={false}
      scroll
      enforceFocus={false}
      className={`event-panel ${placement === 'bottom' ? 'event-panel--sheet' : ''}`}
      aria-labelledby="new-event-title"
    >
      {/* {draft && <FormBody key={`${draft.lat}`} draft={draft} {...rest} />} */}
    </Offcanvas>
  );
}

function FormBody({ draft, type, onTypeChange, onSave, onCancel }: Omit<Props, 'placement' | 'draft'> & { draft: { lat: number; lng: number } }) {

}
