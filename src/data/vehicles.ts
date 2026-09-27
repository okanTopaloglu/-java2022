/**
 * Türkiye'de karavan dönüşümünde en çok tercih edilen panelvanlar.
 * Tüm ölçüler metre cinsindendir ve üretici teknik föylerindeki
 * dış / yük alanı ölçülerine dayanır (H1/H2/H3, L1–L4 gövde tipleri).
 */
export interface VehicleColor {
  name: string;
  hex: string;
}

export interface VehicleSpec {
  id: string;
  brand: string;
  model: string;
  variant: string;
  tagline: string;
  popular?: boolean;
  /** Dönüşüm başlangıç bedeli (TL) – araç hariç, şasi hazırlığı + izolasyon */
  basePrice: number;
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  /** Arka tampondan arka dingil merkezine mesafe */
  rearOverhang: number;
  cargo: {
    length: number;
    width: number;
    /** Tekerlek davlumbazları arası genişlik */
    archWidth: number;
    height: number;
    /** Yük zemini yerden yüksekliği */
    floorHeight: number;
    archHeight: number;
    archLength: number;
  };
  slidingDoor: {
    width: number;
    height: number;
    /** Yük alanı ön sınırından kapı ön kenarına mesafe */
    offset: number;
  };
  rearDoor: { width: number; height: number };
  profile: {
    hoodLength: number;
    hoodHeight: number;
    windshieldTop: number;
    sill: number;
    roofRadius: number;
    noseRadius: number;
  };
  wheel: { radius: number; width: number };
  colors: VehicleColor[];
}

const STELLANTIS_COLORS: VehicleColor[] = [
  { name: 'Buz Beyazı', hex: '#f2f3f5' },
  { name: 'Lanzarote Gri', hex: '#8b8f94' },
  { name: 'Gece Mavisi', hex: '#1f3358' },
  { name: 'Profondo Kırmızı', hex: '#8d1c22' },
  { name: 'Alüminyum Gri', hex: '#b7bcc2' },
  { name: 'Siyah', hex: '#15171a' },
];
const FORD_COLORS: VehicleColor[] = [
  { name: 'Frozen White', hex: '#f4f5f7' },
  { name: 'Moondust Silver', hex: '#c0c4c9' },
  { name: 'Magnetic Gri', hex: '#5a5f66' },
  { name: 'Blazer Mavi', hex: '#1c3f8c' },
  { name: 'Race Kırmızı', hex: '#b3161c' },
  { name: 'Agate Siyah', hex: '#111417' },
];
const MB_COLORS: VehicleColor[] = [
  { name: 'Arktik Beyaz', hex: '#f5f6f6' },
  { name: 'Selenit Gri', hex: '#6e7378' },
  { name: 'Obsidyen Siyah', hex: '#121416' },
  { name: 'Steel Mavi', hex: '#3c5a7d' },
  { name: 'Jüpiter Kırmızı', hex: '#a51d24' },
  { name: 'Gümüş', hex: '#cfd3d6' },
];
const VW_COLORS: VehicleColor[] = [
  { name: 'Candy Beyaz', hex: '#f6f6f4' },
  { name: 'Indium Gri', hex: '#7c8187' },
  { name: 'Deep Ocean Mavi', hex: '#20395e' },
  { name: 'Cherry Kırmızı', hex: '#9c1d27' },
  { name: 'Mojave Bej', hex: '#c8b89a' },
  { name: 'Deep Siyah', hex: '#141618' },
];
const RENAULT_COLORS: VehicleColor[] = [
  { name: 'Buz Beyazı', hex: '#f3f4f6' },
  { name: 'Yıldız Gri', hex: '#8a8e92' },
  { name: 'Kozmos Mavi', hex: '#233a66' },
  { name: 'Kırmızı', hex: '#a3161e' },
  { name: 'Siyah', hex: '#141618' },
];
const IVECO_COLORS: VehicleColor[] = [
  { name: 'Beyaz', hex: '#f4f5f6' },
  { name: 'Gri', hex: '#7d8287' },
  { name: 'Mavi', hex: '#1f3f7a' },
  { name: 'Siyah', hex: '#141618' },
];

export const VEHICLES: VehicleSpec[] = [
  {
    id: 'ducato-l3h2',
    brand: 'Fiat',
    model: 'Ducato',
    variant: 'L3H2',
    tagline: 'Türkiye’nin en sevilen karavan şasisi',
    popular: true,
    basePrice: 185000,
    length: 5.998, width: 2.05, height: 2.524, wheelbase: 4.035, rearOverhang: 1.015,
    cargo: { length: 3.705, width: 1.87, archWidth: 1.422, height: 1.932, floorHeight: 0.535, archHeight: 0.26, archLength: 1.12 },
    slidingDoor: { width: 1.25, height: 1.755, offset: 0.08 },
    rearDoor: { width: 1.562, height: 1.79 },
    profile: { hoodLength: 0.95, hoodHeight: 1.06, windshieldTop: 1.85, sill: 0.42, roofRadius: 0.22, noseRadius: 0.32 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: STELLANTIS_COLORS,
  },
  {
    id: 'ducato-l2h2',
    brand: 'Fiat',
    model: 'Ducato',
    variant: 'L2H2',
    tagline: 'Şehirde rahat, hafta sonu kaçamakları için ideal',
    basePrice: 175000,
    length: 5.413, width: 2.05, height: 2.524, wheelbase: 3.45, rearOverhang: 1.015,
    cargo: { length: 3.12, width: 1.87, archWidth: 1.422, height: 1.932, floorHeight: 0.535, archHeight: 0.26, archLength: 1.12 },
    slidingDoor: { width: 1.25, height: 1.755, offset: 0.08 },
    rearDoor: { width: 1.562, height: 1.79 },
    profile: { hoodLength: 0.95, hoodHeight: 1.06, windshieldTop: 1.85, sill: 0.42, roofRadius: 0.22, noseRadius: 0.32 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: STELLANTIS_COLORS,
  },
  {
    id: 'ducato-l4h3',
    brand: 'Fiat',
    model: 'Ducato',
    variant: 'L4H3',
    tagline: 'Maksimum yaşam alanı: ayakta duş, geniş yatak',
    popular: true,
    basePrice: 205000,
    length: 6.363, width: 2.05, height: 2.76, wheelbase: 4.035, rearOverhang: 1.38,
    cargo: { length: 4.07, width: 1.87, archWidth: 1.422, height: 2.172, floorHeight: 0.535, archHeight: 0.26, archLength: 1.12 },
    slidingDoor: { width: 1.25, height: 1.755, offset: 0.08 },
    rearDoor: { width: 1.562, height: 2.03 },
    profile: { hoodLength: 0.95, hoodHeight: 1.06, windshieldTop: 1.9, sill: 0.42, roofRadius: 0.24, noseRadius: 0.32 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: STELLANTIS_COLORS,
  },
  {
    id: 'boxer-l3h2',
    brand: 'Peugeot',
    model: 'Boxer',
    variant: 'L3H2',
    tagline: 'Ducato ile aynı gövde, Peugeot yorumu',
    basePrice: 185000,
    length: 5.998, width: 2.05, height: 2.524, wheelbase: 4.035, rearOverhang: 1.015,
    cargo: { length: 3.705, width: 1.87, archWidth: 1.422, height: 1.932, floorHeight: 0.535, archHeight: 0.26, archLength: 1.12 },
    slidingDoor: { width: 1.25, height: 1.755, offset: 0.08 },
    rearDoor: { width: 1.562, height: 1.79 },
    profile: { hoodLength: 0.97, hoodHeight: 1.05, windshieldTop: 1.86, sill: 0.42, roofRadius: 0.22, noseRadius: 0.34 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: STELLANTIS_COLORS,
  },
  {
    id: 'jumper-l3h2',
    brand: 'Citroën',
    model: 'Jumper',
    variant: 'L3H2',
    tagline: 'Uygun fiyatlı, geniş yük alanı',
    basePrice: 182000,
    length: 5.998, width: 2.05, height: 2.524, wheelbase: 4.035, rearOverhang: 1.015,
    cargo: { length: 3.705, width: 1.87, archWidth: 1.422, height: 1.932, floorHeight: 0.535, archHeight: 0.26, archLength: 1.12 },
    slidingDoor: { width: 1.25, height: 1.755, offset: 0.08 },
    rearDoor: { width: 1.562, height: 1.79 },
    profile: { hoodLength: 0.97, hoodHeight: 1.05, windshieldTop: 1.86, sill: 0.42, roofRadius: 0.22, noseRadius: 0.34 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: STELLANTIS_COLORS,
  },
  {
    id: 'transit-l3h2',
    brand: 'Ford',
    model: 'Transit',
    variant: 'L3H2 (350L)',
    tagline: 'Kocaeli üretimi, yaygın servis ağı',
    popular: true,
    basePrice: 180000,
    length: 5.981, width: 2.059, height: 2.55, wheelbase: 3.75, rearOverhang: 1.23,
    cargo: { length: 3.494, width: 1.784, archWidth: 1.392, height: 1.886, floorHeight: 0.62, archHeight: 0.28, archLength: 1.15 },
    slidingDoor: { width: 1.3, height: 1.6, offset: 0.06 },
    rearDoor: { width: 1.565, height: 1.75 },
    profile: { hoodLength: 1.05, hoodHeight: 1.08, windshieldTop: 1.95, sill: 0.44, roofRadius: 0.2, noseRadius: 0.36 },
    wheel: { radius: 0.37, width: 0.22 },
    colors: FORD_COLORS,
  },
  {
    id: 'transit-l4h3',
    brand: 'Ford',
    model: 'Transit',
    variant: 'L4H3 (Jumbo)',
    tagline: 'Jumbo gövde: aile karavanı için bol hacim',
    basePrice: 200000,
    length: 6.704, width: 2.059, height: 2.786, wheelbase: 3.75, rearOverhang: 1.953,
    cargo: { length: 4.217, width: 1.784, archWidth: 1.392, height: 2.025, floorHeight: 0.62, archHeight: 0.28, archLength: 1.15 },
    slidingDoor: { width: 1.3, height: 1.6, offset: 0.06 },
    rearDoor: { width: 1.565, height: 1.9 },
    profile: { hoodLength: 1.05, hoodHeight: 1.08, windshieldTop: 2.0, sill: 0.44, roofRadius: 0.22, noseRadius: 0.36 },
    wheel: { radius: 0.37, width: 0.22 },
    colors: FORD_COLORS,
  },
  {
    id: 'transit-custom-l2h2',
    brand: 'Ford',
    model: 'Transit Custom',
    variant: 'L2H2',
    tagline: 'Kompakt ama yüksek tavan – çift kullanım',
    basePrice: 165000,
    length: 5.45, width: 2.032, height: 2.36, wheelbase: 3.3, rearOverhang: 1.13,
    cargo: { length: 2.921, width: 1.775, archWidth: 1.392, height: 1.778, floorHeight: 0.56, archHeight: 0.26, archLength: 1.05 },
    slidingDoor: { width: 1.03, height: 1.32, offset: 0.06 },
    rearDoor: { width: 1.4, height: 1.66 },
    profile: { hoodLength: 1.0, hoodHeight: 0.98, windshieldTop: 1.9, sill: 0.4, roofRadius: 0.2, noseRadius: 0.34 },
    wheel: { radius: 0.34, width: 0.21 },
    colors: FORD_COLORS,
  },
  {
    id: 'sprinter-l2h2',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    variant: 'L2H2 (A2)',
    tagline: 'Premium konfor, güçlü şasi',
    popular: true,
    basePrice: 210000,
    length: 5.932, width: 2.02, height: 2.62, wheelbase: 3.665, rearOverhang: 1.267,
    cargo: { length: 3.272, width: 1.787, archWidth: 1.35, height: 1.927, floorHeight: 0.6, archHeight: 0.27, archLength: 1.12 },
    slidingDoor: { width: 1.26, height: 1.84, offset: 0.05 },
    rearDoor: { width: 1.56, height: 1.84 },
    profile: { hoodLength: 1.15, hoodHeight: 1.1, windshieldTop: 2.05, sill: 0.45, roofRadius: 0.2, noseRadius: 0.38 },
    wheel: { radius: 0.37, width: 0.23 },
    colors: MB_COLORS,
  },
  {
    id: 'sprinter-l3h2',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    variant: 'L3H2 (A3)',
    tagline: 'Uzun şasi, tam donanımlı karavan için',
    basePrice: 225000,
    length: 6.967, width: 2.02, height: 2.62, wheelbase: 4.325, rearOverhang: 1.642,
    cargo: { length: 4.307, width: 1.787, archWidth: 1.35, height: 1.927, floorHeight: 0.6, archHeight: 0.27, archLength: 1.12 },
    slidingDoor: { width: 1.26, height: 1.84, offset: 0.05 },
    rearDoor: { width: 1.56, height: 1.84 },
    profile: { hoodLength: 1.15, hoodHeight: 1.1, windshieldTop: 2.05, sill: 0.45, roofRadius: 0.2, noseRadius: 0.38 },
    wheel: { radius: 0.37, width: 0.23 },
    colors: MB_COLORS,
  },
  {
    id: 'crafter-l3h3',
    brand: 'Volkswagen',
    model: 'Crafter',
    variant: 'L3H3',
    tagline: 'Yüksek tavan, sağlam Alman işçiliği',
    popular: true,
    basePrice: 215000,
    length: 5.986, width: 2.04, height: 2.798, wheelbase: 3.64, rearOverhang: 1.316,
    cargo: { length: 3.45, width: 1.832, archWidth: 1.38, height: 2.196, floorHeight: 0.57, archHeight: 0.27, archLength: 1.12 },
    slidingDoor: { width: 1.311, height: 1.82, offset: 0.06 },
    rearDoor: { width: 1.552, height: 2.0 },
    profile: { hoodLength: 1.1, hoodHeight: 1.08, windshieldTop: 2.0, sill: 0.44, roofRadius: 0.22, noseRadius: 0.36 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: VW_COLORS,
  },
  {
    id: 'crafter-l4h3',
    brand: 'Volkswagen',
    model: 'Crafter',
    variant: 'L4H3',
    tagline: 'En uzun gövde: sabit yatak + banyo + mutfak',
    basePrice: 235000,
    length: 6.836, width: 2.04, height: 2.798, wheelbase: 4.49, rearOverhang: 1.316,
    cargo: { length: 4.3, width: 1.832, archWidth: 1.38, height: 2.196, floorHeight: 0.57, archHeight: 0.27, archLength: 1.12 },
    slidingDoor: { width: 1.311, height: 1.82, offset: 0.06 },
    rearDoor: { width: 1.552, height: 2.0 },
    profile: { hoodLength: 1.1, hoodHeight: 1.08, windshieldTop: 2.0, sill: 0.44, roofRadius: 0.22, noseRadius: 0.36 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: VW_COLORS,
  },
  {
    id: 'transporter-l2h1',
    brand: 'Volkswagen',
    model: 'Transporter T6.1',
    variant: 'L2H1',
    tagline: 'Günlük kullanıma uygun, ikonik camper',
    popular: true,
    basePrice: 150000,
    length: 5.304, width: 1.904, height: 1.99, wheelbase: 3.4, rearOverhang: 0.98,
    cargo: { length: 2.975, width: 1.7, archWidth: 1.244, height: 1.41, floorHeight: 0.57, archHeight: 0.24, archLength: 1.0 },
    slidingDoor: { width: 1.02, height: 1.28, offset: 0.05 },
    rearDoor: { width: 1.47, height: 1.3 },
    profile: { hoodLength: 0.85, hoodHeight: 0.95, windshieldTop: 1.75, sill: 0.38, roofRadius: 0.18, noseRadius: 0.32 },
    wheel: { radius: 0.34, width: 0.21 },
    colors: VW_COLORS,
  },
  {
    id: 'master-l3h2',
    brand: 'Renault',
    model: 'Master',
    variant: 'L3H2',
    tagline: 'Uzun yük alanı, ekonomik bakım',
    basePrice: 180000,
    length: 6.198, width: 2.07, height: 2.499, wheelbase: 4.332, rearOverhang: 1.02,
    cargo: { length: 3.733, width: 1.765, archWidth: 1.38, height: 1.894, floorHeight: 0.55, archHeight: 0.27, archLength: 1.12 },
    slidingDoor: { width: 1.27, height: 1.78, offset: 0.06 },
    rearDoor: { width: 1.58, height: 1.82 },
    profile: { hoodLength: 1.0, hoodHeight: 1.05, windshieldTop: 1.9, sill: 0.42, roofRadius: 0.2, noseRadius: 0.36 },
    wheel: { radius: 0.36, width: 0.22 },
    colors: RENAULT_COLORS,
  },
  {
    id: 'daily-l3h2',
    brand: 'Iveco',
    model: 'Daily 35S',
    variant: 'L3H2',
    tagline: 'Kamyon şasili, ağır yük ve off-road dostu',
    basePrice: 215000,
    length: 6.0, width: 2.01, height: 2.62, wheelbase: 3.52, rearOverhang: 1.36,
    cargo: { length: 3.54, width: 1.8, archWidth: 1.35, height: 1.9, floorHeight: 0.66, archHeight: 0.3, archLength: 1.15 },
    slidingDoor: { width: 1.2, height: 1.75, offset: 0.08 },
    rearDoor: { width: 1.53, height: 1.8 },
    profile: { hoodLength: 1.2, hoodHeight: 1.15, windshieldTop: 2.05, sill: 0.48, roofRadius: 0.2, noseRadius: 0.4 },
    wheel: { radius: 0.38, width: 0.24 },
    colors: IVECO_COLORS,
  },
];

export const DEFAULT_VEHICLE_ID = 'ducato-l3h2';

export function getVehicle(id: string | null | undefined): VehicleSpec {
  return VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];
}

export const BRANDS = Array.from(new Set(VEHICLES.map((v) => v.brand)));
