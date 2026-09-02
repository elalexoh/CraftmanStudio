import { ref, readonly } from 'vue';

// 1. Grilla de Suelo
const showGroundGrid = ref(true);

// 2. Grilla de Estructura del Objeto (Wireframe)
const showObjectWireframe = ref(true);
const wireframeOpacity = ref(0.35);

// 3. Lineart / Contorno Cartoon Blanco
const showObjectLineart = ref(true);
const lineartOpacity = ref(0.95);
const outlineThickness = ref(0.05);

export function useGridState() {
  const toggleGroundGrid = () => {
    showGroundGrid.value = !showGroundGrid.value;
  };

  const toggleObjectWireframe = () => {
    showObjectWireframe.value = !showObjectWireframe.value;
  };

  const toggleObjectLineart = () => {
    showObjectLineart.value = !showObjectLineart.value;
  };

  const setGroundGrid = (visible: boolean) => {
    showGroundGrid.value = visible;
  };

  const setObjectWireframe = (visible: boolean) => {
    showObjectWireframe.value = visible;
  };

  const setWireframeOpacity = (opacity: number) => {
    wireframeOpacity.value = Math.max(0.05, Math.min(1.0, opacity));
  };

  const setObjectLineart = (visible: boolean) => {
    showObjectLineart.value = visible;
  };

  const setLineartOpacity = (opacity: number) => {
    lineartOpacity.value = Math.max(0.05, Math.min(1.0, opacity));
  };

  const setOutlineThickness = (thickness: number) => {
    outlineThickness.value = Math.max(0.005, Math.min(0.20, thickness));
  };

  return {
    showGroundGrid: readonly(showGroundGrid),
    showObjectWireframe: readonly(showObjectWireframe),
    wireframeOpacity: readonly(wireframeOpacity),
    showObjectLineart: readonly(showObjectLineart),
    lineartOpacity: readonly(lineartOpacity),
    outlineThickness: readonly(outlineThickness),
    toggleGroundGrid,
    toggleObjectWireframe,
    toggleObjectLineart,
    setGroundGrid,
    setObjectWireframe,
    setWireframeOpacity,
    setObjectLineart,
    setLineartOpacity,
    setOutlineThickness,
  };
}
