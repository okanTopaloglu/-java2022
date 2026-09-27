import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BRANDS, VEHICLES, getVehicle } from '../data/vehicles';
import { formatTL } from '../data/modules';
import { useStore } from '../store';
import { Logo } from './Logo';

export function VehicleSelect() {
  const vehicleId = useStore((s) => s.vehicleId);
  const preview = useStore((s) => s.previewVehicleId);
  const setPreview = useStore((s) => s.setPreviewVehicle);
  const selectVehicle = useStore((s) => s.selectVehicle);
  const setScreen = useStore((s) => s.setScreen);
  const paint = useStore((s) => s.paint);
  const setPaint = useStore((s) => s.setPaint);
  const [picked, setPicked] = useState(vehicleId);
  const active = getVehicle(preview ?? picked);

  useEffect(() => {
    setPreview(picked);
  }, [picked, setPreview]);

  useEffect(() => () => setPreview(null), [setPreview]);

  const grouped = useMemo(() => BRANDS.map((b) => ({ brand: b, list: VEHICLES.filter((v) => v.brand === b) })), []);

  const go = () => {
    selectVehicle(picked);
    setScreen('configurator');
  };

  return (
    <div className="vs">
      <motion.div className="vs-panel glass" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <div className="vs-head">
          <div>
            <h2>Aracını seç</h2>
            <p>Gövde tipi (L/H) yük alanı ölçülerini belirler.</p>
          </div>
          <button className="btn ghost sm" onClick={() => setScreen('landing')}>← Geri</button>
        </div>
        <div className="vs-list">
          {grouped.map((g) => (
            <div key={g.brand}>
              <div className="brand-title">{g.brand}</div>
              {g.list.map((v) => (
                <button
                  key={v.id}
                  className={`vcard ${picked === v.id ? 'active' : ''}`}
                  onMouseEnter={() => setPreview(v.id)}
                  onMouseLeave={() => setPreview(picked)}
                  onClick={() => setPicked(v.id)}
                  onDoubleClick={() => {
                    setPicked(v.id);
                    selectVehicle(v.id);
                    setScreen('configurator');
                  }}
                >
                  <div>
                    <div className="t">{v.model} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{v.variant}</span></div>
                    <div className="s">{v.tagline}</div>
                    <div className="dims">
                      <span>Boy <b>{(v.length).toFixed(2)} m</b></span>
                      <span>Yük <b>{v.cargo.length.toFixed(2)} × {v.cargo.width.toFixed(2)} × {v.cargo.height.toFixed(2)}</b></span>
                    </div>
                  </div>
                  {v.popular && <span className="pill accent badge">Popüler</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="vs-foot">
          <div className="colors">
            <span className="pill">Renk</span>
            {active.colors.map((c) => (
              <button key={c.hex} className={`swatch ${paint === c.hex ? 'active' : ''}`} style={{ background: c.hex }} title={c.name} onClick={() => setPaint(c.hex)} />
            ))}
          </div>
          <button className="btn primary" onClick={go}>
            {active.brand} {active.model} {active.variant} ile devam et →
          </button>
        </div>
      </motion.div>

      <motion.div className="vs-spec glass" key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h3>{active.brand} {active.model} <span style={{ color: 'var(--muted)' }}>{active.variant}</span></h3>
        <div className="spec-grid">
          <span>Uzunluk</span><b>{(active.length * 1000).toFixed(0)} mm</b>
          <span>Genişlik</span><b>{(active.width * 1000).toFixed(0)} mm</b>
          <span>Yükseklik</span><b>{(active.height * 1000).toFixed(0)} mm</b>
          <span>Dingil mesafesi</span><b>{(active.wheelbase * 1000).toFixed(0)} mm</b>
          <span>Yük alanı boyu</span><b>{(active.cargo.length * 1000).toFixed(0)} mm</b>
          <span>Yük alanı eni</span><b>{(active.cargo.width * 1000).toFixed(0)} mm</b>
          <span>Davlumbaz arası</span><b>{(active.cargo.archWidth * 1000).toFixed(0)} mm</b>
          <span>İç yükseklik</span><b>{(active.cargo.height * 1000).toFixed(0)} mm</b>
          <span>Sürgülü kapı</span><b>{(active.slidingDoor.width * 1000).toFixed(0)} × {(active.slidingDoor.height * 1000).toFixed(0)}</b>
          <span>Dönüşüm başlangıç</span><b>{formatTL(active.basePrice)}</b>
        </div>
      </motion.div>
      <div style={{ position: 'fixed', top: 16, right: 16, pointerEvents: 'none' }}><Logo compact /></div>
    </div>
  );
}
