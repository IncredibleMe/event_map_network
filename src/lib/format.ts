const TZ = 'Europe/Athens';

const dayFmt = new Intl.DateTimeFormat('el-GR', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  timeZone: TZ,
});
const timeFmt = new Intl.DateTimeFormat('el-GR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ });
const fullFmt = new Intl.DateTimeFormat('el-GR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TZ,
});

export function formatWhen(startIso: string, endIso?: string): string {
  const s = new Date(startIso);
  if (!endIso) return `${dayFmt.format(s)}, ${timeFmt.format(s)}`;
  const e = new Date(endIso);
  const sameDay = dayFmt.format(s) === dayFmt.format(e);
  return sameDay
    ? `${dayFmt.format(s)}, ${timeFmt.format(s)} έως ${timeFmt.format(e)}`
    : `${dayFmt.format(s)} έως ${dayFmt.format(e)}`;
}

export function formatFullDate(iso: string): string {
  return fullFmt.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export type EventStatus = { label: string; tone: 'live' | 'soon' | 'later' | 'past' };

export function eventStatus(startIso: string, endIso: string | undefined, now = new Date()): EventStatus {
  const s = new Date(startIso).getTime();
  const e = endIso ? new Date(endIso).getTime() : s + 3 * 3600_000;
  const t = now.getTime();
  if (t >= s && t <= e) return { label: 'Σε εξέλιξη', tone: 'live' };
  if (t > e) return { label: 'Ολοκληρώθηκε', tone: 'past' };
  const days = Math.ceil((s - t) / 86_400_000);
  if (days <= 1) return { label: 'Αύριο ή σήμερα', tone: 'soon' };
  if (days <= 7) return { label: `Σε ${days} μέρες`, tone: 'soon' };
  return { label: `Σε ${days} μέρες`, tone: 'later' };
}

export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}° Β, ${lng.toFixed(5)}° Α`;
}
