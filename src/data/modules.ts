/**
 * Karavan modül kataloğu. Ölçüler metre: [x genişlik, y yükseklik, z derinlik].
 * Zemin modüllerinde x/z araç eksenine göre, duvar modüllerinde x duvar boyunca,
 * z ise duvardan iç mekâna doğru çıkıntıdır. Fiyatlar TL (placeholder, düzenlenebilir).
 */
export type Mount = 'floor' | 'wall' | 'roof' | 'exterior';
export type WallSide = 'L' | 'R' | 'rear';
export type Category =
  | 'yatak'
  | 'mutfak'
  | 'depolama'
  | 'banyo'
  | 'oturma'
  | 'pencere'
  | 'cati'
  | 'enerji'
  | 'dis';

export interface ModuleDef {
  id: string;
  name: string;
  category: Category;
  kind: string;
  mount: Mount;
  size: [number, number, number];
  price: number;
  desc: string;
  icon: string;
  /** Duvar / çatıda delik açar (pencere, havalandırma) */
  hole?: boolean;
  /** Duvar modülleri için varsayılan merkez yüksekliği (zemine göre) */
  wallY?: number;
  /** Duvar modülünün konabileceği yüzeyler */
  sides?: WallSide[];
  /** Seçilebilir kaplama renkleri */
  colors?: string[];
  /** Sadece bir adet eklenebilir */
  single?: boolean;
  /** Dış ekipman bağlantı noktası */
  anchor?: 'right' | 'rear' | 'rearLeft' | 'roof';
}

export const CATEGORIES: { id: Category; name: string; icon: string }[] = [
  { id: 'yatak', name: 'Yatak', icon: '🛏️' },
  { id: 'mutfak', name: 'Mutfak', icon: '🍳' },
  { id: 'depolama', name: 'Dolap', icon: '🗄️' },
  { id: 'banyo', name: 'Banyo', icon: '🚿' },
  { id: 'oturma', name: 'Oturma', icon: '🛋️' },
  { id: 'pencere', name: 'Pencere', icon: '🪟' },
  { id: 'cati', name: 'Çatı', icon: '☀️' },
  { id: 'enerji', name: 'Teknik', icon: '🔋' },
  { id: 'dis', name: 'Dış', icon: '⛺' },
];

const WOOD = ['#c9a074', '#9b6b43', '#e6d2b5', '#5b3d2a'];
const LAMINATE = ['#f1efe9', '#dcd7cc', '#9aa3ad', '#2f343b'];
const FABRIC = ['#c8b79a', '#7a8b9c', '#5e6b53', '#8c4a3f', '#e3ded4'];

export const MODULES: ModuleDef[] = [
  // ---------------- YATAK ----------------
  {
    id: 'bed-double',
    name: 'Sabit Çift Kişilik Yatak',
    category: 'yatak',
    kind: 'bed',
    mount: 'floor',
    size: [1.4, 0.64, 1.85],
    price: 26000,
    desc: 'Arkaya enine yerleştirilen sabit yatak; altı bagaj/garaj olarak kullanılır.',
    icon: '🛏️',
    colors: FABRIC,
  },
  {
    id: 'bed-single',
    name: 'Tek Kişilik Yatak',
    category: 'yatak',
    kind: 'bed',
    mount: 'floor',
    size: [0.8, 0.62, 1.9],
    price: 15000,
    desc: 'Duvar boyu tek kişilik yatak, altı depolama.',
    icon: '🛏️',
    colors: FABRIC,
  },
  {
    id: 'bed-sofa',
    name: 'Yataklı Kanepe',
    category: 'yatak',
    kind: 'sofa',
    mount: 'floor',
    size: [1.8, 0.95, 0.95],
    price: 32000,
    desc: 'Gündüz kanepe, gece açılarak 1.80 × 1.40 yatak.',
    icon: '🛋️',
    colors: FABRIC,
  },
  {
    id: 'bed-bunk',
    name: 'Ranza (2 Katlı)',
    category: 'yatak',
    kind: 'bunk',
    mount: 'floor',
    size: [0.85, 1.75, 1.9],
    price: 24000,
    desc: 'Çocuklu aileler için iki katlı ranza.',
    icon: '🪜',
    colors: FABRIC,
  },

  // ---------------- MUTFAK ----------------
  {
    id: 'kitchen-block',
    name: 'Mutfak Bloğu (Evye + Ocak)',
    category: 'mutfak',
    kind: 'kitchen',
    mount: 'floor',
    size: [1.2, 0.9, 0.6],
    price: 38000,
    desc: 'Paslanmaz evye, 2 gözlü ocak, alt dolap ve çekmece.',
    icon: '🍳',
    colors: WOOD,
  },
  {
    id: 'kitchen-compact',
    name: 'Kompakt Mutfak',
    category: 'mutfak',
    kind: 'kitchen',
    mount: 'floor',
    size: [0.9, 0.9, 0.55],
    price: 29000,
    desc: 'Küçük araçlar için evye + tek ocak.',
    icon: '🍳',
    colors: WOOD,
  },
  {
    id: 'fridge-compressor',
    name: 'Kompresörlü Buzdolabı 65 L',
    category: 'mutfak',
    kind: 'fridge',
    mount: 'floor',
    size: [0.48, 0.62, 0.55],
    price: 18000,
    desc: '12V kompresörlü, tezgâh altı buzdolabı.',
    icon: '🧊',
  },
  {
    id: 'fridge-tall',
    name: 'Dik Buzdolabı 130 L',
    category: 'mutfak',
    kind: 'fridge',
    mount: 'floor',
    size: [0.55, 1.25, 0.6],
    price: 32000,
    desc: 'Dondurucu bölmeli dik buzdolabı.',
    icon: '🧊',
  },
  {
    id: 'worktop-ext',
    name: 'Tezgâh Uzatma Dolabı',
    category: 'mutfak',
    kind: 'cabinet',
    mount: 'floor',
    size: [0.6, 0.9, 0.6],
    price: 9500,
    desc: 'Mutfak tezgâhını uzatan kapaklı alt dolap.',
    icon: '🪵',
    colors: WOOD,
  },

  // ---------------- DEPOLAMA ----------------
  {
    id: 'wardrobe',
    name: 'Gardırop',
    category: 'depolama',
    kind: 'wardrobe',
    mount: 'floor',
    size: [0.6, 1.8, 0.6],
    price: 16500,
    desc: 'Askılı bölme + raf, tam boy gardırop.',
    icon: '🚪',
    colors: WOOD,
  },
  {
    id: 'cabinet-base',
    name: 'Alt Dolap',
    category: 'depolama',
    kind: 'cabinet',
    mount: 'floor',
    size: [0.8, 0.9, 0.55],
    price: 9800,
    desc: 'Çift kapaklı, raflı alt dolap.',
    icon: '🗄️',
    colors: WOOD,
  },
  {
    id: 'drawers',
    name: 'Çekmeceli Ünite',
    category: 'depolama',
    kind: 'drawers',
    mount: 'floor',
    size: [0.6, 0.9, 0.55],
    price: 11500,
    desc: '3 çekmeceli, yumuşak kapanan ünite.',
    icon: '🧰',
    colors: WOOD,
  },
  {
    id: 'overhead',
    name: 'Üst Dolap',
    category: 'depolama',
    kind: 'overhead',
    mount: 'wall',
    size: [1.0, 0.38, 0.35],
    price: 8500,
    desc: 'Tavana yakın, yukarı açılan kapaklı üst dolap.',
    icon: '📦',
    wallY: 1.55,
    sides: ['L', 'R'],
    colors: WOOD,
  },
  {
    id: 'overhead-long',
    name: 'Üst Dolap (Uzun)',
    category: 'depolama',
    kind: 'overhead',
    mount: 'wall',
    size: [1.6, 0.38, 0.35],
    price: 12500,
    desc: '1.60 m uzunluğunda üç kapaklı üst dolap.',
    icon: '📦',
    wallY: 1.55,
    sides: ['L', 'R'],
    colors: WOOD,
  },
  {
    id: 'shelf',
    name: 'Açık Raf',
    category: 'depolama',
    kind: 'shelf',
    mount: 'wall',
    size: [0.8, 0.05, 0.25],
    price: 2200,
    desc: 'Dekoratif açık raf.',
    icon: '📚',
    wallY: 1.35,
    sides: ['L', 'R', 'rear'],
    colors: WOOD,
  },

  // ---------------- BANYO ----------------
  {
    id: 'wetbath',
    name: 'Duş + Tuvalet Kabini',
    category: 'banyo',
    kind: 'wetbath',
    mount: 'floor',
    size: [0.8, 1.9, 0.85],
    price: 48000,
    desc: 'Kaset tuvalet, duş başlığı, su geçirmez kabin.',
    icon: '🚿',
    colors: LAMINATE,
  },
  {
    id: 'toilet',
    name: 'Kaset Tuvalet',
    category: 'banyo',
    kind: 'toilet',
    mount: 'floor',
    size: [0.4, 0.5, 0.55],
    price: 9500,
    desc: 'Taşınabilir / gömme kaset tuvalet.',
    icon: '🚽',
  },
  {
    id: 'shower-tray',
    name: 'Duş Teknesi + Perde',
    category: 'banyo',
    kind: 'shower',
    mount: 'floor',
    size: [0.7, 1.9, 0.7],
    price: 14000,
    desc: 'Alçak duş teknesi, tavan perde rayı ve gider.',
    icon: '🛁',
  },

  // ---------------- OTURMA ----------------
  {
    id: 'table',
    name: 'Yemek Masası',
    category: 'oturma',
    kind: 'table',
    mount: 'floor',
    size: [0.8, 0.75, 0.6],
    price: 6500,
    desc: 'Tek ayaklı, sökülebilir masa.',
    icon: '🪑',
    colors: WOOD,
  },
  {
    id: 'bench',
    name: 'Sandıklı Bank',
    category: 'oturma',
    kind: 'bench',
    mount: 'floor',
    size: [1.0, 0.95, 0.55],
    price: 12500,
    desc: 'Altı sandık, sırtlıklı bank koltuk.',
    icon: '🛋️',
    colors: FABRIC,
  },
  {
    id: 'swivel',
    name: 'Döner Koltuk',
    category: 'oturma',
    kind: 'seat',
    mount: 'floor',
    size: [0.55, 1.0, 0.55],
    price: 14500,
    desc: 'Emniyet kemerli, döner tabanlı yolcu koltuğu.',
    icon: '💺',
    colors: FABRIC,
  },

  // ---------------- PENCERE ----------------
  {
    id: 'window-fixed',
    name: 'Sabit Pencere 90×50',
    category: 'pencere',
    kind: 'window',
    mount: 'wall',
    size: [0.9, 0.5, 0.0],
    price: 7500,
    desc: 'Çift camlı, çerçeveli sabit karavan penceresi.',
    icon: '🪟',
    hole: true,
    wallY: 1.15,
    sides: ['L', 'R'],
  },
  {
    id: 'window-opening',
    name: 'Açılır Pencere 70×40',
    category: 'pencere',
    kind: 'window-opening',
    mount: 'wall',
    size: [0.7, 0.4, 0.0],
    price: 9800,
    desc: 'Dışa açılır, sineklikli ve karartma perdeli pencere.',
    icon: '🪟',
    hole: true,
    wallY: 1.2,
    sides: ['L', 'R'],
  },
  {
    id: 'window-large',
    name: 'Panoramik Pencere 120×60',
    category: 'pencere',
    kind: 'window',
    mount: 'wall',
    size: [1.2, 0.6, 0.0],
    price: 13500,
    desc: 'Geniş manzara için panoramik cam.',
    icon: '🪟',
    hole: true,
    wallY: 1.15,
    sides: ['L', 'R'],
  },
  {
    id: 'window-porthole',
    name: 'Lombar Pencere 30×30',
    category: 'pencere',
    kind: 'window-opening',
    mount: 'wall',
    size: [0.3, 0.3, 0.0],
    price: 4800,
    desc: 'Banyo / mutfak için küçük havalandırma penceresi.',
    icon: '⚪',
    hole: true,
    wallY: 1.4,
    sides: ['L', 'R'],
  },
  {
    id: 'window-rear',
    name: 'Arka Kapı Camları (Çift)',
    category: 'pencere',
    kind: 'window-rear',
    mount: 'wall',
    size: [1.3, 0.55, 0.0],
    price: 11000,
    desc: 'Her iki arka kapıya sabit cam.',
    icon: '🚪',
    hole: true,
    wallY: 1.25,
    sides: ['rear'],
    single: true,
  },
  {
    id: 'window-slider',
    name: 'Sürgülü Kapı Camı',
    category: 'pencere',
    kind: 'window-slider',
    mount: 'wall',
    size: [0.95, 0.5, 0.0],
    price: 8800,
    desc: 'Sürgülü kapıya açılır cam.',
    icon: '🪟',
    hole: true,
    wallY: 1.25,
    sides: ['R'],
    single: true,
  },

  // ---------------- ÇATI ----------------
  {
    id: 'roof-vent',
    name: 'Tavan Fanı 40×40',
    category: 'cati',
    kind: 'vent',
    mount: 'roof',
    size: [0.4, 0.12, 0.4],
    price: 8500,
    desc: 'Çift yönlü havalandırma fanı (MaxxFan tipi).',
    icon: '🌀',
    hole: true,
  },
  {
    id: 'roof-window',
    name: 'Tavan Penceresi 70×50',
    category: 'cati',
    kind: 'roofwindow',
    mount: 'roof',
    size: [0.7, 0.1, 0.5],
    price: 9800,
    desc: 'Yukarı açılır, perdeli tavan penceresi.',
    icon: '🌤️',
    hole: true,
  },
  {
    id: 'solar-200',
    name: 'Güneş Paneli 200 W',
    category: 'cati',
    kind: 'solar',
    mount: 'roof',
    size: [1.58, 0.04, 0.81],
    price: 12500,
    desc: 'Monokristal 200 W panel + MPPT regülatör.',
    icon: '☀️',
  },
  {
    id: 'solar-400',
    name: 'Güneş Paneli 2×200 W',
    category: 'cati',
    kind: 'solar',
    mount: 'roof',
    size: [1.58, 0.04, 1.66],
    price: 23500,
    desc: 'İki panel, 400 W toplam güç.',
    icon: '☀️',
  },
  {
    id: 'roof-ac',
    name: 'Tavan Kliması',
    category: 'cati',
    kind: 'ac',
    mount: 'roof',
    size: [0.9, 0.25, 0.7],
    price: 42000,
    desc: '2.2 kW soğutma, düşük profilli tavan kliması.',
    icon: '❄️',
    hole: true,
  },
  {
    id: 'roof-rack',
    name: 'Tavan Portbagajı',
    category: 'cati',
    kind: 'rack',
    mount: 'exterior',
    size: [0, 0, 0],
    price: 14000,
    desc: 'Alüminyum tavan portbagajı, ray sistemi.',
    icon: '🧗',
    single: true,
    anchor: 'roof',
  },

  // ---------------- TEKNİK ----------------
  {
    id: 'battery',
    name: 'LiFePO4 Akü 200 Ah',
    category: 'enerji',
    kind: 'battery',
    mount: 'floor',
    size: [0.52, 0.24, 0.25],
    price: 34000,
    desc: 'Lityum yaşam aküsü, BMS dahil.',
    icon: '🔋',
  },
  {
    id: 'heater',
    name: 'Dizel Isıtıcı 2 kW',
    category: 'enerji',
    kind: 'heater',
    mount: 'floor',
    size: [0.32, 0.14, 0.13],
    price: 12500,
    desc: 'Zemin altı montajlı hava ısıtıcı.',
    icon: '🔥',
  },
  {
    id: 'water-tank',
    name: 'Temiz Su Tankı 100 L',
    category: 'enerji',
    kind: 'tank',
    mount: 'floor',
    size: [0.8, 0.35, 0.4],
    price: 6500,
    desc: 'Gıdaya uygun polietilen su tankı + pompa.',
    icon: '💧',
  },
  {
    id: 'inverter',
    name: 'İnvertör 2000 W',
    category: 'enerji',
    kind: 'inverter',
    mount: 'wall',
    size: [0.42, 0.28, 0.12],
    price: 15500,
    desc: 'Saf sinüs invertör + şarj cihazı.',
    icon: '⚡',
    wallY: 0.55,
    sides: ['L', 'R', 'rear'],
  },

  // ---------------- DIŞ ----------------
  {
    id: 'awning',
    name: 'Tente 3 m',
    category: 'dis',
    kind: 'awning',
    mount: 'exterior',
    size: [0, 0, 0],
    price: 22000,
    desc: 'Kasetli, manuel açılır 3 metre tente.',
    icon: '⛺',
    single: true,
    anchor: 'right',
  },
  {
    id: 'bike-rack',
    name: 'Bisiklet Taşıyıcı',
    category: 'dis',
    kind: 'bikerack',
    mount: 'exterior',
    size: [0, 0, 0],
    price: 9500,
    desc: 'Arka kapı montajlı 2 bisiklet taşıyıcı.',
    icon: '🚲',
    single: true,
    anchor: 'rear',
  },
  {
    id: 'ladder',
    name: 'Arka Merdiven',
    category: 'dis',
    kind: 'ladder',
    mount: 'exterior',
    size: [0, 0, 0],
    price: 5500,
    desc: 'Tavana erişim için alüminyum merdiven.',
    icon: '🪜',
    single: true,
    anchor: 'rearLeft',
  },
];

export function getModule(id: string): ModuleDef {
  const def = MODULES.find((m) => m.id === id);
  if (!def) throw new Error(`Bilinmeyen modül: ${id}`);
  return def;
}

export function formatTL(n: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}

export function formatCm(m: number): string {
  return `${Math.round(m * 100)} cm`;
}
