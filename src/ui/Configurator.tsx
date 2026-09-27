import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { CATEGORIES, MODULES, formatCm, formatTL, getModule } from '../data/modules';
import { getVehicle } from '../data/vehicles';
import { vanMetrics } from '../utils/metrics';
import { totalPrice, useStore } from '../store';
import { copyText, shareUrl } from '../utils/share';
import { isTouchDevice } from '../three/shared';
import { Joystick } from './Joystick';
import { Logo } from './Logo';

/* ---------------- Üst çubuk ---------------- */
function TopBar({ onQuote }: { onQuote: () => void }) {
  const { vehicleId, modules, setScreen, undo, historyLen, requestScreenshot, notify } = useStore(
    useShallow((s) => ({
      vehicleId: s.vehicleId,
      modules: s.modules,
      setScreen: s.setScreen,
      undo: s.undo,
      historyLen: s.history.length,
      requestScreenshot: s.requestScreenshot,
      notify: s.notify,
    })),
  );
  const v = getVehicle(vehicleId);
  const price = totalPrice({ vehicleId, modules });
  const share = async () => {
    const url = shareUrl({ vehicleId, paint: useStore.getState().paint, modules });
    history.replaceState(null, '', url);
    const ok = await copyText(url);
    notify(ok ? 'Paylaşım bağlantısı kopyalandı' : 'Bağlantı adres çubuğuna yazıldı', 'ok');
  };
  return (
    <div className="topbar glass">
      <button className="btn ghost sm icon" onClick={() => setScreen('vehicle')} title="Araç değiştir">←</button>
      <div className="hide-m"><Logo compact /></div>
      <div className="grow">
        <div className="title">{v.brand} {v.model} {v.variant}</div>
        <div className="sub">{modules.length} modül · Yük alanı {formatCm(v.cargo.length)} × {formatCm(v.cargo.width)} × {formatCm(v.cargo.height)}</div>
      </div>
      <div className="price">{formatTL(price)}</div>
      <div className="actions">
        <button className="btn sm icon" onClick={undo} disabled={!historyLen} title="Geri al (Ctrl+Z)">↶</button>
        <button className="btn sm icon hide-m" onClick={requestScreenshot} title="Ekran görüntüsü">📷</button>
        <button className="btn sm icon" onClick={share} title="Paylaş">🔗</button>
        <button className="btn sm primary" onClick={onQuote}>Teklif Al</button>
      </div>
    </div>
  );
}

/* ---------------- Katalog ---------------- */
function Catalog() {
  const { activeCategory, setActiveCategory, addModule, open, applyPreset, modules } = useStore(
    useShallow((s) => ({
      activeCategory: s.activeCategory,
      setActiveCategory: s.setActiveCategory,
      addModule: s.addModule,
      open: s.catalogOpen,
      applyPreset: s.applyPreset,
      modules: s.modules,
    })),
  );
  const items = useMemo(() => MODULES.filter((m) => m.category === activeCategory), [activeCategory]);
  const cat = CATEGORIES.find((c) => c.id === activeCategory);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="catalog glass" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="cats">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`cat ${c.id === activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(c.id)}>
                <span className="ic">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
          <div className="items">
            {modules.length === 0 && (
              <>
                <h4>Hazır yerleşimler</h4>
                <div className="presets">
                  <button className="btn sm" onClick={() => applyPreset('couple')}>💑 Çift</button>
                  <button className="btn sm" onClick={() => applyPreset('family')}>👨‍👩‍👧 Aile</button>
                  <button className="btn sm" onClick={() => applyPreset('weekend')}>🏕️ Hafta sonu</button>
                </div>
              </>
            )}
            <h4>{cat?.icon} {cat?.name} — eklemek için dokun</h4>
            {items.map((m) => {
              const disabled = !!m.single && modules.some((x) => x.defId === m.id);
              return (
                <button key={m.id} className="item" onClick={() => addModule(m.id)} disabled={disabled}>
                  <span className="ic">{m.icon}</span>
                  <span>
                    <span className="n">{m.name}</span>
                    <span className="d">
                      {m.desc}
                      {m.size[0] > 0 && (
                        <>
                          {' '}· <b>{formatCm(m.size[0])} × {formatCm(m.size[1])}{m.size[2] > 0 ? ` × ${formatCm(m.size[2])}` : ''}</b>
                        </>
                      )}
                    </span>
                  </span>
                  <span>
                    <span className="p">{formatTL(m.price)}</span>
                    <span className="plus">{disabled ? '✓' : '+'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Özellikler / Özet ---------------- */
function Inspector() {
  const { selectedUid, modules, vehicleId, updateModule, rotateModule, removeModule, duplicateModule, setSelected, open, resetDesign, paint, setPaint } = useStore(
    useShallow((s) => ({
      selectedUid: s.selectedUid,
      modules: s.modules,
      vehicleId: s.vehicleId,
      updateModule: s.updateModule,
      rotateModule: s.rotateModule,
      removeModule: s.removeModule,
      duplicateModule: s.duplicateModule,
      setSelected: s.setSelected,
      open: s.inspectorOpen,
      resetDesign: s.resetDesign,
      paint: s.paint,
      setPaint: s.setPaint,
    })),
  );
  const v = getVehicle(vehicleId);
  const mt = useMemo(() => vanMetrics(v), [v]);
  const m = modules.find((x) => x.uid === selectedUid);
  const def = m ? getModule(m.defId) : null;
  const price = totalPrice({ vehicleId, modules });
  const mobile = window.innerWidth <= 900;
  if (!open || (mobile && !m)) return null;

  const wallSides = def?.sides ?? ['L', 'R'];
  const sideName = { L: 'Sol', R: 'Sağ', rear: 'Arka' } as const;

  return (
    <motion.div className="inspector glass" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
      {m && def ? (
        <>
          <div className="insp-head">
            <div>
              <h3>{def.icon} {def.name}</h3>
              <p>{formatTL(def.price)}{def.size[0] > 0 && ` · ${formatCm(def.size[0])} × ${formatCm(def.size[1])}${def.size[2] > 0 ? ` × ${formatCm(def.size[2])}` : ''}`}</p>
            </div>
            <button className="btn ghost sm icon" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="insp-body">
            {def.mount === 'floor' && (
              <>
                <div className="row">
                  <label>Boyuna konum (arkadan)</label>
                  <span className="val">{formatCm(m.x)}</span>
                </div>
                <input type="range" min={mt.cargo.x0} max={mt.cargo.x1} step={0.025} value={m.x} onChange={(e) => updateModule(m.uid, { x: +e.target.value }, { magnet: false })} />
                <div className="row">
                  <label>Enine konum (sol ↔ sağ)</label>
                  <span className="val">{formatCm(m.z)}</span>
                </div>
                <input type="range" min={mt.cargo.z0} max={mt.cargo.z1} step={0.025} value={m.z} onChange={(e) => updateModule(m.uid, { z: +e.target.value }, { magnet: false })} />
                <div className="row">
                  <label>Yön</label>
                  <button className="btn sm" onClick={() => rotateModule(m.uid)}>↻ 90° döndür (R)</button>
                </div>
              </>
            )}
            {def.mount === 'wall' && (
              <>
                {wallSides.length > 1 && (
                  <div className="row">
                    <label>Duvar</label>
                    <div className="seg">
                      {wallSides.map((s) => (
                        <button key={s} className={(m.side ?? 'R') === s ? 'active' : ''} onClick={() => updateModule(m.uid, { side: s, x: s === 'rear' ? mt.cargo.x0 : mt.cargo.x1 / 2, z: 0 })}>{sideName[s]}</button>
                      ))}
                    </div>
                  </div>
                )}
                {def.kind !== 'window-rear' && (
                  <>
                    <div className="row">
                      <label>{m.side === 'rear' ? 'Enine konum' : 'Boyuna konum (arkadan)'}</label>
                      <span className="val">{formatCm(m.side === 'rear' ? m.z : m.x)}</span>
                    </div>
                    {m.side === 'rear' ? (
                      <input type="range" min={mt.rd.z0} max={mt.rd.z1} step={0.025} value={m.z} onChange={(e) => updateModule(m.uid, { z: +e.target.value })} />
                    ) : (
                      <input type="range" min={mt.cargo.x0} max={mt.cargo.x1} step={0.025} value={m.x} onChange={(e) => updateModule(m.uid, { x: +e.target.value })} />
                    )}
                  </>
                )}
                <div className="row">
                  <label>Yükseklik (zeminden)</label>
                  <span className="val">{formatCm(m.y - mt.cargo.y0)}</span>
                </div>
                <input type="range" min={mt.cargo.y0} max={mt.cargo.y1} step={0.025} value={m.y} onChange={(e) => updateModule(m.uid, { y: +e.target.value })} />
              </>
            )}
            {def.mount === 'roof' && (
              <>
                <div className="row">
                  <label>Boyuna konum</label>
                  <span className="val">{formatCm(m.x)}</span>
                </div>
                <input type="range" min={mt.cargo.x0} max={mt.cargo.x1} step={0.025} value={m.x} onChange={(e) => updateModule(m.uid, { x: +e.target.value })} />
                <div className="row">
                  <label>Enine konum</label>
                  <span className="val">{formatCm(m.z)}</span>
                </div>
                <input type="range" min={mt.cargo.z0} max={mt.cargo.z1} step={0.025} value={m.z} onChange={(e) => updateModule(m.uid, { z: +e.target.value })} />
              </>
            )}
            {def.colors && (
              <div className="row">
                <label>Kaplama</label>
                <div className="colors">
                  {def.colors.map((c) => (
                    <button key={c} className={`swatch ${(m.color ?? def.colors![0]) === c ? 'active' : ''}`} style={{ background: c }} onClick={() => updateModule(m.uid, { color: c })} />
                  ))}
                </div>
              </div>
            )}
            <div className="row" style={{ gap: 6 }}>
              {!def.single && <button className="btn sm" onClick={() => duplicateModule(m.uid)}>⧉ Kopyala</button>}
              <button className="btn sm danger" onClick={() => removeModule(m.uid)}>🗑 Kaldır</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="insp-head">
            <div>
              <h3>Tasarımın</h3>
              <p>Bir modüle dokunarak düzenle, sürükleyerek taşı.</p>
            </div>
          </div>
          <div className="insp-body">
            <div className="row">
              <label>Kaporta rengi</label>
              <div className="colors">
                {v.colors.map((c) => (
                  <button key={c.hex} className={`swatch ${paint === c.hex ? 'active' : ''}`} style={{ background: c.hex }} title={c.name} onClick={() => setPaint(c.hex)} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="summary">
        <h4>Özet · {modules.length} modül</h4>
        <div className="sum-list">
          <div className="r"><span>Şasi hazırlığı ({v.model})</span><span>{formatTL(v.basePrice)}</span></div>
          {modules.map((x) => {
            const d = getModule(x.defId);
            return (
              <div key={x.uid} className={`r ${x.uid === selectedUid ? 'sel' : ''}`} onClick={() => setSelected(x.uid)}>
                <span>{d.icon} {d.name}</span>
                <span>{formatTL(d.price)}</span>
              </div>
            );
          })}
        </div>
        <div className="sum-total"><span>Toplam</span><span>{formatTL(price)}</span></div>
        {modules.length > 0 && (
          <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => { if (confirm('Tüm modüller kaldırılsın mı?')) resetDesign(); }}>Temizle</button>
        )}
      </div>
    </motion.div>
  );
}

/* ---------------- Alt araç çubuğu ---------------- */
function Toolbar() {
  const { flyTo, view, toggleView, setCameraMode, setView } = useStore(
    useShallow((s) => ({ flyTo: s.flyTo, view: s.view, toggleView: s.toggleView, setCameraMode: s.setCameraMode, setView: s.setView })),
  );
  return (
    <div className="toolbar glass">
      <button className="btn sm" onClick={() => flyTo('side')}>Yan</button>
      <button className="btn sm" onClick={() => flyTo('front')}>Ön</button>
      <button className="btn sm" onClick={() => flyTo('rear')}>Arka</button>
      <button className="btn sm" onClick={() => flyTo('top')}>Üstten</button>
      <button className="btn sm" onClick={() => flyTo('inside')}>İç plan</button>
      <div className="sep" />
      <button className={`btn sm ${!view.roof ? 'active' : ''}`} onClick={() => toggleView('roof')} title="Çatıyı gizle/göster">Çatı</button>
      <button className={`btn sm ${!view.wallR ? 'active' : ''}`} onClick={() => toggleView('wallR')} title="Sağ duvarı gizle/göster">Sağ duvar</button>
      <button className={`btn sm ${view.xray ? 'active' : ''}`} onClick={() => toggleView('xray')}>Röntgen</button>
      <button className={`btn sm ${view.night ? 'active' : ''}`} onClick={() => toggleView('night')}>🌙 Gece</button>
      <div className="sep" />
      <button className={`btn sm ${view.doorSlide ? 'active' : ''}`} onClick={() => toggleView('doorSlide')}>Sürgülü kapı</button>
      <button className={`btn sm ${view.doorRear ? 'active' : ''}`} onClick={() => toggleView('doorRear')}>Arka kapı</button>
      <div className="sep" />
      <button className="btn sm primary" onClick={() => { setView({ doorSlide: true }); setCameraMode('walk'); }}>🚶 İçinde gez</button>
    </div>
  );
}

function WalkHud() {
  const { setCameraMode, view, toggleView } = useStore(useShallow((s) => ({ setCameraMode: s.setCameraMode, view: s.view, toggleView: s.toggleView })));
  const touch = isTouchDevice();
  return (
    <div className="walk-hud">
      <div className="hint glass">{touch ? 'Sol joystick ile yürü · Ekranı sürükleyerek etrafına bak' : 'W A S D ile yürü · Fareyle sürükleyerek bak · Shift koş · Esc çık'}</div>
      <div className="crosshair" />
      <button className="btn exit" onClick={() => setCameraMode('orbit')}>✕ Çık</button>
      {touch && <Joystick />}
      <div className="doors">
        <button className={`btn sm ${view.doorSlide ? 'active' : ''}`} onClick={() => toggleView('doorSlide')}>Sürgülü kapı</button>
        <button className={`btn sm ${view.doorRear ? 'active' : ''}`} onClick={() => toggleView('doorRear')}>Arka kapı</button>
        <button className={`btn sm ${view.night ? 'active' : ''}`} onClick={() => toggleView('night')}>🌙</button>
      </div>
    </div>
  );
}

/* ---------------- Teklif ---------------- */
function QuoteModal({ onClose }: { onClose: () => void }) {
  const { vehicleId, modules, paint, notify } = useStore(useShallow((s) => ({ vehicleId: s.vehicleId, modules: s.modules, paint: s.paint, notify: s.notify })));
  const v = getVehicle(vehicleId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const price = totalPrice({ vehicleId, modules });
  const url = shareUrl({ vehicleId, paint, modules });
  const lines = [
    `Karavan Teklif Talebi`,
    `Ad: ${name || '-'} | Tel: ${phone || '-'}`,
    `Araç: ${v.brand} ${v.model} ${v.variant} (${paint})`,
    ...modules.map((m) => `• ${getModule(m.defId).name} – ${formatTL(getModule(m.defId).price)}`),
    `Toplam tahmini: ${formatTL(price)}`,
    note ? `Not: ${note}` : '',
    `Tasarım: ${url}`,
  ].filter(Boolean);
  const text = lines.join('\n');
  const download = () => {
    const blob = new Blob([JSON.stringify({ vehicle: v.id, paint, modules, total: price, url }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'karavan-tasarim.json';
    a.click();
  };
  return (
    <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal glass" initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2>Teklif al</h2>
        <p>Tasarımını ekibimize ilet; ölçülere göre kesin fiyat ve üretim süresi çıkaralım.</p>
        <div className="field"><label>Ad Soyad</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız" /></div>
        <div className="field"><label>Telefon</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xx xx" /></div>
        <div className="field"><label>Not</label><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Özel istekler, teslim tarihi…" /></div>
        <div className="mono">{text}</div>
        <div className="actions">
          <a className="btn primary" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">WhatsApp ile gönder</a>
          <a className="btn" href={`mailto:?subject=${encodeURIComponent('Karavan teklif talebi')}&body=${encodeURIComponent(text)}`}>E-posta</a>
          <button className="btn" onClick={async () => { await copyText(text); notify('Teklif metni kopyalandı', 'ok'); }}>Kopyala</button>
          <button className="btn ghost" onClick={download}>JSON indir</button>
          <button className="btn ghost" onClick={onClose}>Kapat</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Klavye kısayolları ---------------- */
function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState();
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        if (s.cameraMode === 'walk') s.setCameraMode('orbit');
        else s.setSelected(null);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        s.undo();
        return;
      }
      if (s.cameraMode === 'walk' || !s.selectedUid) return;
      const uid = s.selectedUid;
      const m = s.modules.find((x) => x.uid === uid);
      if (!m) return;
      const def = getModule(m.defId);
      const step = e.shiftKey ? 0.1 : 0.025;
      if (e.key === 'Delete' || e.key === 'Backspace') s.removeModule(uid);
      else if (e.key.toLowerCase() === 'r') s.rotateModule(uid);
      else if (e.key.toLowerCase() === 'd') s.duplicateModule(uid);
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        if (def.mount === 'floor' || def.mount === 'roof') {
          if (e.key === 'ArrowUp') s.updateModule(uid, { x: m.x + step }, { magnet: false });
          if (e.key === 'ArrowDown') s.updateModule(uid, { x: m.x - step }, { magnet: false });
          if (e.key === 'ArrowLeft') s.updateModule(uid, { z: m.z - step }, { magnet: false });
          if (e.key === 'ArrowRight') s.updateModule(uid, { z: m.z + step }, { magnet: false });
        } else if (def.mount === 'wall') {
          const along = m.side === 'rear' ? 'z' : 'x';
          if (e.key === 'ArrowUp') s.updateModule(uid, { y: m.y + step });
          if (e.key === 'ArrowDown') s.updateModule(uid, { y: m.y - step });
          if (e.key === 'ArrowLeft') s.updateModule(uid, { [along]: m[along] - step });
          if (e.key === 'ArrowRight') s.updateModule(uid, { [along]: m[along] + step });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function Toast() {
  const toast = useStore((s) => s.toast);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <AnimatePresence>
      {visible && toast && (
        <motion.div key={toast.id} className={`toast glass ${toast.tone ?? ''}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Configurator() {
  useShortcuts();
  const cameraMode = useStore((s) => s.cameraMode);
  const { catalogOpen, setCatalogOpen, inspectorOpen, setInspectorOpen, selectedUid } = useStore(
    useShallow((s) => ({ catalogOpen: s.catalogOpen, setCatalogOpen: s.setCatalogOpen, inspectorOpen: s.inspectorOpen, setInspectorOpen: s.setInspectorOpen, selectedUid: s.selectedUid })),
  );
  const [quote, setQuote] = useState(false);
  const mobile = window.innerWidth <= 900;

  useEffect(() => {
    if (mobile) {
      setCatalogOpen(false);
      setInspectorOpen(true);
    }
  }, [mobile, setCatalogOpen, setInspectorOpen]);

  if (cameraMode === 'walk') return <WalkHud />;

  return (
    <>
      <TopBar onQuote={() => setQuote(true)} />
      <Catalog />
      <Inspector />
      <Toolbar />
      <div className="sheet-toggle">
        <button className={`btn ${catalogOpen ? 'active' : ''}`} onClick={() => { setCatalogOpen(!catalogOpen); if (!catalogOpen) useStore.getState().setSelected(null); }}>＋ Modül ekle</button>
        <button className={`btn ${inspectorOpen && !catalogOpen ? 'active' : ''}`} onClick={() => { setInspectorOpen(!inspectorOpen || catalogOpen); setCatalogOpen(false); }} disabled={!selectedUid}>⚙ Düzenle</button>
      </div>
      <AnimatePresence>{quote && <QuoteModal onClose={() => setQuote(false)} />}</AnimatePresence>
    </>
  );
}
