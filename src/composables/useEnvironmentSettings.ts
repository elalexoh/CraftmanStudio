import { ref, readonly } from 'vue';

export type GridMode = 'standard' | 'isometric' | 'curvilinear' | 'one_point' | 'two_point' | 'polar';

export interface ColorPreset {
  label: string;
  value: string;
}

export const BG_COLOR_PRESETS: ColorPreset[] = [
  { label: 'Cielo Claro', value: '#f1f5f9' },
  { label: 'Estudio Oscuro', value: '#18181b' },
  { label: 'Gris Neutro', value: '#64748b' },
  { label: 'Blanco Puro', value: '#ffffff' },
  { label: 'Verde Chroma', value: '#00b140' },
  { label: 'Cálido Sepia', value: '#fef3c7' },
];

export const GRID_COLOR_PRESETS: ColorPreset[] = [
  { label: 'Cian Guía', value: '#06b6d4' },
  { label: 'Azul Técnico', value: '#2563eb' },
  { label: 'Gris Grafito', value: '#475569' },
  { label: 'Blanco', value: '#ffffff' },
  { label: 'Magenta', value: '#ec4899' },
  { label: 'Verde Neón', value: '#10b981' },
];

export const GRID_MODE_OPTIONS: { id: GridMode; label: string; desc: string }[] = [
  { id: 'standard', label: 'Cartesiana', desc: 'Grilla de suelo cuadrada estándar' },
  { id: 'isometric', label: 'Isométrica / 3 Ejes', desc: 'Líneas a 0°, 60° y 120° (triangular/hex)' },
  { id: 'curvilinear', label: 'Curvilínea 360°', desc: 'Arcos de fuga 5 puntos estilo ojo de pez' },
  { id: 'one_point', label: '1 Punto de Fuga', desc: 'Perspectiva central de habitación/pasillo' },
  { id: 'two_point', label: '2 Puntos de Fuga', desc: 'Puntos en el horizonte a 90°' },
  { id: 'polar', label: 'Polar Concéntrica', desc: 'Anillos concéntricos y rayos radiales' },
];

const backgroundColor = ref('#f1f5f9');
const gridColor = ref('#06b6d4');
const gridOpacity = ref(0.4);
const gridMode = ref<GridMode>('standard');

type EnvCallback = (settings: {
  backgroundColor: string;
  gridColor: string;
  gridOpacity: number;
  gridMode: GridMode;
}) => void;

const listeners = new Set<EnvCallback>();

function notify() {
  const current = {
    backgroundColor: backgroundColor.value,
    gridColor: gridColor.value,
    gridOpacity: gridOpacity.value,
    gridMode: gridMode.value,
  };
  listeners.forEach(cb => cb(current));
}

export function onEnvironmentChanged(callback: EnvCallback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function useEnvironmentSettings() {
  const setBackgroundColor = (color: string) => {
    backgroundColor.value = color;
    notify();
  };

  const setGridColor = (color: string) => {
    gridColor.value = color;
    notify();
  };

  const setGridOpacity = (opacity: number) => {
    gridOpacity.value = Math.max(0.05, Math.min(1.0, opacity));
    notify();
  };

  const setGridMode = (mode: GridMode) => {
    gridMode.value = mode;
    notify();
  };

  return {
    backgroundColor: readonly(backgroundColor),
    gridColor: readonly(gridColor),
    gridOpacity: readonly(gridOpacity),
    gridMode: readonly(gridMode),
    setBackgroundColor,
    setGridColor,
    setGridOpacity,
    setGridMode,
  };
}
