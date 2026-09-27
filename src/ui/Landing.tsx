import { motion } from 'framer-motion';
import { useStore } from '../store';
import { Logo } from './Logo';

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3 } },
});

export function Landing() {
  const setScreen = useStore((s) => s.setScreen);
  const hasDesign = useStore((s) => s.modules.length > 0);
  return (
    <div className="landing">
      <motion.div className="landing-nav" {...fade(0)}>
        <Logo />
        <div className="links">
          <button className="btn ghost sm" onClick={() => setScreen('vehicle')}>Araçlar</button>
          {hasDesign && (
            <button className="btn sm" onClick={() => setScreen('configurator')}>Kaldığım tasarıma dön</button>
          )}
        </div>
      </motion.div>

      <div className="hero">
        <motion.div className="eyebrow" {...fade(0.1)}>3 Boyutlu Karavan Tasarım Stüdyosu</motion.div>
        <motion.h1 {...fade(0.2)}>
          Hayalindeki karavanı <span>kendin tasarla</span>
        </motion.h1>
        <motion.p {...fade(0.3)}>
          Türkiye’de en çok tercih edilen panelvanları birebir ölçüleriyle seç; pencere, kapı, yatak, mutfak,
          dolap ve buzdolabını sürükle-bırak ile yerleştir. Sonra içine gir, gez, düzenle.
        </motion.p>
        <motion.div className="cta" {...fade(0.4)}>
          <button className="btn primary" onClick={() => setScreen('vehicle')}>
            Karavanını Oluştur →
          </button>
          <span className="pill">Ücretsiz · Kayıt gerektirmez</span>
        </motion.div>
        <motion.div className="features" {...fade(0.55)}>
          <div className="feature glass">
            <span className="ic">📐</span>
            <div><b>Birebir ölçüler</b><small>Ducato, Transit, Sprinter, Crafter…</small></div>
          </div>
          <div className="feature glass">
            <span className="ic">🧲</span>
            <div><b>Sürükle & yerleştir</b><small>Duvara yapışır, çakışmayı uyarır</small></div>
          </div>
          <div className="feature glass">
            <span className="ic">🚶</span>
            <div><b>İçinde gez</b><small>Mobil joystick / WASD ile</small></div>
          </div>
        </motion.div>
      </div>

      <motion.div className="landing-foot" {...fade(0.7)}>
        <div className="hint">🖱️ Sürükleyerek aracı döndür · Kaydırarak yaklaş</div>
        <div>15 araç · 40+ modül · Anlık fiyat</div>
      </motion.div>
    </div>
  );
}
