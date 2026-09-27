/** Bileşenler arası paylaşılan, render döngüsünde okunan hafif durum (re-render tetiklemez). */
export const doorState = { slide: 0, rear: 0 };

export const walkInput = {
  /** Sanal joystick: -1..1 (x: sağ, y: ileri) */
  move: { x: 0, y: 0 },
  /** Ekran sürükleme ile bakış deltası (piksel) */
  look: { dx: 0, dy: 0 },
  run: false,
};

export const isTouchDevice = () =>
  typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);

export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 900;
