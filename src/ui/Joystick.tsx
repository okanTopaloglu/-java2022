import { useRef } from 'react';
import { walkInput } from '../three/shared';

export function Joystick() {
  const knob = useRef<HTMLDivElement>(null);
  const active = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  const setKnob = (dx: number, dy: number) => {
    if (knob.current) knob.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  };

  return (
    <div
      className="joystick"
      onPointerDown={(e) => {
        active.current = e.pointerId;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }}
      onPointerMove={(e) => {
        if (active.current !== e.pointerId) return;
        let dx = e.clientX - origin.current.x;
        let dy = e.clientY - origin.current.y;
        const max = 48;
        const d = Math.hypot(dx, dy);
        if (d > max) {
          dx = (dx / d) * max;
          dy = (dy / d) * max;
        }
        setKnob(dx, dy);
        walkInput.move.x = dx / max;
        walkInput.move.y = -dy / max;
        walkInput.run = d > max * 0.92;
      }}
      onPointerUp={(e) => {
        if (active.current !== e.pointerId) return;
        active.current = null;
        setKnob(0, 0);
        walkInput.move.x = 0;
        walkInput.move.y = 0;
        walkInput.run = false;
      }}
      onPointerCancel={() => {
        active.current = null;
        setKnob(0, 0);
        walkInput.move.x = 0;
        walkInput.move.y = 0;
      }}
    >
      <div className="knob" ref={knob} />
    </div>
  );
}
