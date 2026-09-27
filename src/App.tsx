import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Scene } from './three/Scene';
import { Landing } from './ui/Landing';
import { VehicleSelect } from './ui/VehicleSelect';
import { Configurator, Toast } from './ui/Configurator';
import { useStore } from './store';
import { readShareHash } from './utils/share';

export default function App() {
  const screen = useStore((s) => s.screen);
  useEffect(() => {
    const snap = readShareHash();
    if (snap) {
      const s = useStore.getState();
      s.loadSnapshot(snap);
      s.setScreen('configurator');
      s.notify('Paylaşılan tasarım yüklendi', 'ok');
    }
  }, []);
  return (
    <>
      <Scene />
      <div className="ui-root">
        <AnimatePresence mode="sync">
          {screen === 'landing' && <Landing key="landing" />}
          {screen === 'vehicle' && <VehicleSelect key="vehicle" />}
          {screen === 'configurator' && <Configurator key="conf" />}
        </AnimatePresence>
        <Toast />
      </div>
    </>
  );
}
