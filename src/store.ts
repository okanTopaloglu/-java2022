import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_VEHICLE_ID, getVehicle, type VehicleSpec } from './data/vehicles';
import { getModule, MODULES, type WallSide } from './data/modules';
import {
  clampModule,
  collides,
  findFreeSpot,
  magnetToWalls,
  newUid,
  refitModules,
  type PlacedModule,
} from './utils/layout';

export type Screen = 'landing' | 'vehicle' | 'configurator';
export type CameraMode = 'orbit' | 'walk';
export type FlyPreset = 'hero' | 'side' | 'rear' | 'top' | 'front' | 'inside' | 'showroom' | 'kitchen';

export interface ViewState {
  roof: boolean;
  wallR: boolean;
  xray: boolean;
  night: boolean;
  doorSlide: boolean;
  doorRear: boolean;
}

export interface Snapshot {
  vehicleId: string;
  paint: string;
  modules: PlacedModule[];
}

interface State {
  screen: Screen;
  vehicleId: string;
  previewVehicleId: string | null;
  paint: string;
  modules: PlacedModule[];
  selectedUid: string | null;
  draggingUid: string | null;
  cameraMode: CameraMode;
  fly: { id: number; preset: FlyPreset } | null;
  view: ViewState;
  catalogOpen: boolean;
  inspectorOpen: boolean;
  activeCategory: string;
  toast: { id: number; text: string; tone?: 'ok' | 'warn' } | null;
  screenshotSeq: number;
  history: Snapshot[];

  setScreen: (s: Screen) => void;
  setPreviewVehicle: (id: string | null) => void;
  selectVehicle: (id: string) => void;
  setPaint: (hex: string) => void;
  addModule: (defId: string, side?: WallSide) => void;
  removeModule: (uid: string) => void;
  updateModule: (uid: string, patch: Partial<PlacedModule>, opts?: { snap?: boolean; magnet?: boolean }) => boolean;
  rotateModule: (uid: string) => void;
  duplicateModule: (uid: string) => void;
  setSelected: (uid: string | null) => void;
  setDragging: (uid: string | null) => void;
  setCameraMode: (m: CameraMode) => void;
  flyTo: (p: FlyPreset) => void;
  setView: (patch: Partial<ViewState>) => void;
  toggleView: (k: keyof ViewState) => void;
  setCatalogOpen: (v: boolean) => void;
  setInspectorOpen: (v: boolean) => void;
  setActiveCategory: (c: string) => void;
  notify: (text: string, tone?: 'ok' | 'warn') => void;
  requestScreenshot: () => void;
  resetDesign: () => void;
  loadSnapshot: (s: Snapshot) => void;
  undo: () => void;
  applyPreset: (preset: 'family' | 'couple' | 'weekend') => void;
}

const DEFAULT_VIEW: ViewState = {
  roof: true,
  wallR: true,
  xray: false,
  night: false,
  doorSlide: false,
  doorRear: false,
};

let flyId = 0;
let toastId = 0;

function pushHistory(get: () => State): Snapshot[] {
  const { vehicleId, paint, modules, history } = get();
  const snap: Snapshot = { vehicleId, paint, modules };
  return [...history.slice(-24), snap];
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      screen: 'landing',
      vehicleId: DEFAULT_VEHICLE_ID,
      previewVehicleId: null,
      paint: '#f2f3f5',
      modules: [],
      selectedUid: null,
      draggingUid: null,
      cameraMode: 'orbit',
      fly: null,
      view: DEFAULT_VIEW,
      catalogOpen: true,
      inspectorOpen: true,
      activeCategory: 'yatak',
      toast: null,
      screenshotSeq: 0,
      history: [],

      setScreen: (screen) => {
        const patch: Partial<State> = { screen, selectedUid: null, draggingUid: null };
        if (screen !== 'configurator') patch.cameraMode = 'orbit';
        if (screen === 'landing') patch.fly = { id: ++flyId, preset: 'hero' };
        if (screen === 'vehicle') patch.fly = { id: ++flyId, preset: 'showroom' };
        if (screen === 'configurator') patch.fly = { id: ++flyId, preset: 'side' };
        set(patch);
      },
      setPreviewVehicle: (id) => set({ previewVehicleId: id }),
      selectVehicle: (id) => {
        const v = getVehicle(id);
        const paintOk = v.colors.some((c) => c.hex === get().paint);
        set({
          vehicleId: id,
          previewVehicleId: null,
          paint: paintOk ? get().paint : v.colors[0].hex,
          modules: refitModules(get().modules, v),
          history: pushHistory(get),
        });
      },
      setPaint: (paint) => set({ paint }),

      addModule: (defId, side) => {
        const def = getModule(defId);
        const vehicle = currentVehicle(get());
        const modules = get().modules;
        if (def.single && modules.some((m) => m.defId === defId)) {
          get().notify(`${def.name} zaten ekli.`, 'warn');
          return;
        }
        const placed = findFreeSpot(def, modules, vehicle, side);
        if (def.mount !== 'exterior' && collides(placed, def, modules, vehicle)) {
          get().notify('Uygun boş alan bulunamadı, modül üst üste yerleşti; sürükleyerek düzenleyin.', 'warn');
        }
        set({
          modules: [...modules, placed],
          selectedUid: placed.uid,
          history: pushHistory(get),
          catalogOpen: window.innerWidth > 900 ? get().catalogOpen : false,
        });
        if (def.mount === 'roof' && get().view.roof === false) get().notify('Çatı gizli; çatı ekipmanını görmek için çatıyı açın.', 'warn');
        get().notify(`${def.name} eklendi`, 'ok');
      },
      removeModule: (uid) =>
        set((s) => ({
          modules: s.modules.filter((m) => m.uid !== uid),
          selectedUid: s.selectedUid === uid ? null : s.selectedUid,
          history: pushHistory(get),
        })),
      updateModule: (uid, patch, opts) => {
        const s = get();
        const idx = s.modules.findIndex((m) => m.uid === uid);
        if (idx < 0) return false;
        const def = getModule(s.modules[idx].defId);
        const vehicle = currentVehicle(s);
        let next: PlacedModule = { ...s.modules[idx], ...patch };
        if (opts?.magnet !== false) next = magnetToWalls(next, def, vehicle);
        next = clampModule(next, def, vehicle, opts?.snap !== false);
        const ok = !collides(next, def, s.modules, vehicle);
        const modules = s.modules.slice();
        modules[idx] = next;
        set({ modules });
        return ok;
      },
      rotateModule: (uid) => {
        const s = get();
        const m = s.modules.find((x) => x.uid === uid);
        if (!m) return;
        const def = getModule(m.defId);
        if (def.mount !== 'floor') return;
        const vehicle = currentVehicle(s);
        const rotated = clampModule({ ...m, rot: (m.rot + 1) % 4 }, def, vehicle);
        const modules = s.modules.map((x) => (x.uid === uid ? rotated : x));
        set({ modules, history: pushHistory(get) });
        if (collides(rotated, def, s.modules, vehicle)) get().notify('Döndürülen modül başka bir parçayla çakışıyor.', 'warn');
      },
      duplicateModule: (uid) => {
        const s = get();
        const m = s.modules.find((x) => x.uid === uid);
        if (!m) return;
        const def = getModule(m.defId);
        if (def.single) return;
        const vehicle = currentVehicle(s);
        const placed = { ...findFreeSpot(def, s.modules, vehicle, m.side), color: m.color, rot: m.rot };
        const fitted = clampModule(placed, def, vehicle);
        set({ modules: [...s.modules, fitted], selectedUid: fitted.uid, history: pushHistory(get) });
      },
      setSelected: (uid) => set({ selectedUid: uid, inspectorOpen: uid ? true : get().inspectorOpen }),
      setDragging: (uid) => {
        if (uid === null && get().draggingUid) set({ draggingUid: null, history: pushHistory(get) });
        else set({ draggingUid: uid });
      },
      setCameraMode: (cameraMode) => {
        const patch: Partial<State> = { cameraMode, selectedUid: null, draggingUid: null };
        if (cameraMode === 'walk') {
          patch.view = { ...get().view, roof: true, wallR: true, xray: false };
          patch.catalogOpen = false;
        } else {
          patch.fly = { id: ++flyId, preset: 'side' };
        }
        set(patch);
      },
      flyTo: (preset) => {
        const patch: Partial<State> = { fly: { id: ++flyId, preset }, cameraMode: 'orbit' };
        if (preset === 'top') patch.view = { ...get().view, roof: false };
        if (preset === 'inside') patch.view = { ...get().view, wallR: false };
        set(patch);
      },
      setView: (patch) => set((s) => ({ view: { ...s.view, ...patch } })),
      toggleView: (k) => set((s) => ({ view: { ...s.view, [k]: !s.view[k] } })),
      setCatalogOpen: (catalogOpen) => set({ catalogOpen }),
      setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
      setActiveCategory: (activeCategory) => set({ activeCategory, catalogOpen: true }),
      notify: (text, tone) => set({ toast: { id: ++toastId, text, tone } }),
      requestScreenshot: () => set((s) => ({ screenshotSeq: s.screenshotSeq + 1 })),
      resetDesign: () => set({ modules: [], selectedUid: null, history: pushHistory(get) }),
      loadSnapshot: (snap) => {
        const v = getVehicle(snap.vehicleId);
        set({
          vehicleId: v.id,
          paint: snap.paint,
          modules: refitModules(snap.modules, v),
          selectedUid: null,
          history: pushHistory(get),
        });
      },
      undo: () => {
        const h = get().history;
        if (!h.length) return;
        const last = h[h.length - 1];
        const v = getVehicle(last.vehicleId);
        set({
          history: h.slice(0, -1),
          vehicleId: v.id,
          paint: last.paint,
          modules: refitModules(last.modules, v),
          selectedUid: null,
        });
      },
      applyPreset: (preset) => {
        const vehicle = currentVehicle(get());
        const list = PRESETS[preset];
        const modules: PlacedModule[] = [];
        for (const item of list) {
          const def = MODULES.find((d) => d.id === item.defId);
          if (!def) continue;
          if (def.mount === 'exterior') {
            modules.push({ uid: newUid(), defId: def.id, x: 0, y: 0, z: 0, rot: 0 });
            continue;
          }
          const placed = findFreeSpot(def, modules, vehicle, item.side);
          modules.push(placed);
        }
        set({ modules, selectedUid: null, history: pushHistory(get) });
        get().notify('Hazır yerleşim uygulandı. Her parçayı sürükleyerek değiştirebilirsiniz.', 'ok');
      },
    }),
    {
      name: 'karavan-3d-v1',
      partialize: (s) => ({
        vehicleId: s.vehicleId,
        paint: s.paint,
        modules: s.modules,
        view: { ...s.view, xray: false, roof: true, wallR: true },
      }),
    },
  ),
);

export function currentVehicle(s: Pick<State, 'vehicleId' | 'previewVehicleId' | 'screen'>): VehicleSpec {
  if (s.screen === 'vehicle' && s.previewVehicleId) return getVehicle(s.previewVehicleId);
  return getVehicle(s.vehicleId);
}

export const useVehicleId = () =>
  useStore((s) => (s.screen === 'vehicle' && s.previewVehicleId ? s.previewVehicleId : s.vehicleId));

const PRESETS: Record<'family' | 'couple' | 'weekend', { defId: string; side?: WallSide }[]> = {
  couple: [
    { defId: 'bed-double' },
    { defId: 'kitchen-block' },
    { defId: 'fridge-compressor' },
    { defId: 'wardrobe' },
    { defId: 'wetbath' },
    { defId: 'swivel' },
    { defId: 'window-fixed', side: 'L' },
    { defId: 'window-opening', side: 'R' },
    { defId: 'window-rear', side: 'rear' },
    { defId: 'overhead', side: 'L' },
    { defId: 'roof-vent' },
    { defId: 'solar-200' },
    { defId: 'battery' },
    { defId: 'water-tank' },
    { defId: 'awning' },
  ],
  family: [
    { defId: 'bed-double' },
    { defId: 'bed-bunk' },
    { defId: 'kitchen-compact' },
    { defId: 'fridge-compressor' },
    { defId: 'toilet' },
    { defId: 'bench' },
    { defId: 'table' },
    { defId: 'window-large', side: 'L' },
    { defId: 'window-opening', side: 'R' },
    { defId: 'window-porthole', side: 'L' },
    { defId: 'window-rear', side: 'rear' },
    { defId: 'overhead-long', side: 'R' },
    { defId: 'roof-vent' },
    { defId: 'roof-window' },
    { defId: 'solar-400' },
    { defId: 'battery' },
    { defId: 'heater' },
    { defId: 'awning' },
    { defId: 'bike-rack' },
  ],
  weekend: [
    { defId: 'bed-sofa' },
    { defId: 'kitchen-compact' },
    { defId: 'fridge-compressor' },
    { defId: 'cabinet-base' },
    { defId: 'table' },
    { defId: 'window-opening', side: 'L' },
    { defId: 'window-slider', side: 'R' },
    { defId: 'roof-vent' },
    { defId: 'solar-200' },
    { defId: 'battery' },
  ],
};

export function totalPrice(s: Pick<State, 'vehicleId' | 'modules'>): number {
  const v = getVehicle(s.vehicleId);
  return v.basePrice + s.modules.reduce((sum, m) => sum + getModule(m.defId).price, 0);
}
