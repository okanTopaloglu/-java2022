import type { Snapshot } from '../store';

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSnapshot(s: Snapshot): string {
  const compact = {
    v: s.vehicleId,
    p: s.paint,
    m: s.modules.map((m) => [m.defId, +m.x.toFixed(3), +m.y.toFixed(3), +m.z.toFixed(3), m.rot, m.side ?? '', m.color ?? '']),
  };
  return toBase64Url(JSON.stringify(compact));
}

export function decodeSnapshot(code: string): Snapshot | null {
  try {
    const c = JSON.parse(fromBase64Url(code)) as { v: string; p: string; m: [string, number, number, number, number, string, string][] };
    if (!c || typeof c.v !== 'string' || !Array.isArray(c.m)) return null;
    return {
      vehicleId: c.v,
      paint: typeof c.p === 'string' ? c.p : '#f2f3f5',
      modules: c.m.map((r, i) => ({
        uid: `s${i}-${Math.random().toString(36).slice(2, 7)}`,
        defId: r[0],
        x: r[1],
        y: r[2],
        z: r[3],
        rot: r[4] ?? 0,
        side: r[5] ? (r[5] as 'L' | 'R' | 'rear') : undefined,
        color: r[6] || undefined,
      })),
    };
  } catch {
    return null;
  }
}

export function shareUrl(s: Snapshot): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#d=${encodeSnapshot(s)}`;
}

export function readShareHash(): Snapshot | null {
  const m = location.hash.match(/#d=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  return decodeSnapshot(m[1]);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
