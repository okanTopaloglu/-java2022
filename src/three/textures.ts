import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();

function canvasTexture(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, repeat = 1): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

function rnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Meşe parke zemin dokusu */
export function woodTexture(base = '#c9a074', repeat = 1): THREE.Texture {
  return canvasTexture(`wood-${base}`, 512, (ctx, s) => {
    const r = rnd(7);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    const planks = 6;
    const ph = s / planks;
    for (let i = 0; i < planks; i++) {
      const off = (i % 2) * (s / 3);
      const shade = (r() - 0.5) * 22;
      ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 255 : 0},${shade > 0 ? 255 : 0},${Math.abs(shade) / 255})`;
      ctx.fillRect(0, i * ph, s, ph);
      // damar
      for (let k = 0; k < 18; k++) {
        ctx.strokeStyle = `rgba(60,35,15,${0.04 + r() * 0.08})`;
        ctx.lineWidth = 1 + r() * 1.5;
        ctx.beginPath();
        const y = i * ph + r() * ph;
        ctx.moveTo(0, y);
        for (let x = 0; x <= s; x += 32) ctx.lineTo(x, y + Math.sin(x / 40 + k) * 2 + (r() - 0.5) * 3);
        ctx.stroke();
      }
      // derz
      ctx.fillStyle = 'rgba(30,18,8,0.45)';
      ctx.fillRect(0, i * ph, s, 2);
      ctx.fillRect((off + s / 2) % s, i * ph, 2, ph);
    }
  }, repeat);
}

/** Güneş paneli hücre dokusu */
export function solarTexture(cols = 6, rows = 10): THREE.Texture {
  return canvasTexture(`solar-${cols}-${rows}`, 512, (ctx, s) => {
    ctx.fillStyle = '#d9dde3';
    ctx.fillRect(0, 0, s, s);
    const cw = s / cols;
    const ch = s / rows;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const g = ctx.createLinearGradient(i * cw, j * ch, (i + 1) * cw, (j + 1) * ch);
        g.addColorStop(0, '#0f1f4a');
        g.addColorStop(1, '#1d3a7d');
        ctx.fillStyle = g;
        ctx.fillRect(i * cw + 3, j * ch + 3, cw - 6, ch - 6);
        ctx.strokeStyle = 'rgba(220,230,255,0.35)';
        ctx.lineWidth = 1;
        for (let k = 1; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(i * cw + (cw / 3) * k, j * ch + 3);
          ctx.lineTo(i * cw + (cw / 3) * k, (j + 1) * ch - 3);
          ctx.stroke();
        }
      }
    }
  });
}

/** Kumaş dokusu */
export function fabricTexture(base = '#c8b79a'): THREE.Texture {
  return canvasTexture(`fabric-${base}`, 256, (ctx, s) => {
    const r = rnd(3);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 4000; i++) {
      const v = (r() - 0.5) * 30;
      ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`;
      ctx.fillRect(r() * s, r() * s, 2, 2);
    }
  }, 3);
}

/** Showroom zemin ızgarası */
export function gridTexture(): THREE.Texture {
  return canvasTexture('grid', 512, (ctx, s) => {
    ctx.fillStyle = '#0e1217';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(120,150,190,0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 1); ctx.lineTo(s, 1);
    ctx.moveTo(1, 0); ctx.lineTo(1, s);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120,150,190,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (s / 4) * i); ctx.lineTo(s, (s / 4) * i);
      ctx.moveTo((s / 4) * i, 0); ctx.lineTo((s / 4) * i, s);
      ctx.stroke();
    }
  }, 40);
}

/** Beton / asfalt zemin */
export function asphaltTexture(): THREE.Texture {
  return canvasTexture('asphalt', 512, (ctx, s) => {
    const r = rnd(11);
    ctx.fillStyle = '#2a2d31';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) {
      const v = (r() - 0.5) * 40;
      ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`;
      ctx.fillRect(r() * s, r() * s, 2, 2);
    }
  }, 30);
}
