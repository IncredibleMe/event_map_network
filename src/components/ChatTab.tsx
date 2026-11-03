import { useEffect, useRef, useState } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import type { ChatService } from '../lib/chatService';
import type { ChatMessage } from '../types';
import { formatTime } from '../lib/format';
import { load, save } from '../lib/storage';
import Icon from './Icon';

interface Props {
  eventId: string;
  chat: ChatService;
  onCount: (n: number) => void;
}

function defaultNick() {
  return `Επισκέπτης ${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function ChatTab({ eventId, chat, onCount }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => chat.history(eventId));
  const [text, setText] = useState('');
  const [nick, setNick] = useState<string>(() => load('nick', defaultNick()));
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(chat.history(eventId));
    return chat.subscribe(eventId, setMessages);
  }, [chat, eventId]);

  useEffect(() => {
    onCount(messages.length);
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, onCount]);

  useEffect(() => save('nick', nick), [nick]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    chat.send(eventId, nick.trim() || 'Επισκέπτης', t);
    setText('');
  };

  return (
    <div className="chat d-flex flex-column gap-2 h-100">
      <Alert variant="success" className="py-2 px-3 mb-0 small d-flex gap-2 align-items-start">
        <span className="live-dot mt-1" aria-hidden="true" />
        <span>Ζωντανή συνομιλία σε τοπική λειτουργία. Άνοιξε τη σελίδα και σε δεύτερη καρτέλα για να δεις τα μηνύματα να φτάνουν ζωντανά.</span>
      </Alert>

      <div className="chat-list flex-grow-1 d-flex flex-column gap-2" ref={listRef} aria-live="polite">
        {messages.length === 0 && <p className="text-body-secondary text-center my-4">Κανένα μήνυμα ακόμα. Γράψε το πρώτο.</p>}
        {messages.map((m) => {
          const mine = m.clientId === chat.clientId;
          return (
            <div
              key={m.id}
              className={`msg border rounded px-2 py-1 ${mine ? 'align-self-end bg-primary-subtle border-primary-subtle' : 'align-self-start bg-body-tertiary'}`}
            >
              <div className="d-flex gap-2 small text-body-secondary">
                <strong className="text-body">{mine ? 'Εσύ' : m.author}</strong>
                <time dateTime={m.at} className="font-monospace">
                  {formatTime(m.at)}
                </time>
              </div>
              <p className="mb-0 text-break">{m.text}</p>
            </div>
          );
        })}
      </div>

      <Form onSubmit={send} className="border-top pt-2 d-flex flex-column gap-2">
        <InputGroup size="sm">
          <InputGroup.Text as="label" htmlFor="chat-nick">
            Όνομα
          </InputGroup.Text>
          <Form.Control id="chat-nick" value={nick} maxLength={32} onChange={(e) => setNick(e.target.value)} />
        </InputGroup>
        <InputGroup>
          <Form.Control
            id="chat-input"
            aria-label="Μήνυμα"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Γράψε μήνυμα…"
            autoComplete="off"
            maxLength={500}
          />
          <Button type="submit" variant="primary" disabled={!text.trim()}>
            <Icon name="send" className="me-1" />
            Αποστολή
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
}
