import { ref, readonly } from 'vue';
import type { ShapeType, ShapeItem } from '../three/types/scene';

export const SHAPES_CATALOG: ShapeItem[] = [
  { id: 'sphere', label: 'Esfera', description: 'Gradientes continuos y punto especular' },
  { id: 'cube', label: 'Cubo', description: 'Caras planas y aristas duras' },
  { id: 'cylinder', label: 'Cilindro', description: 'Gradiente cilíndrico y cara plana' },
  { id: 'cone', label: 'Cono', description: 'Gradiente que converge en vértice' },
  { id: 'torus', label: 'Toroide', description: 'Sombras proyectadas sobre concavidades' },
  { id: 'asaro', label: 'Asaro Head', description: 'Planos anatómicos de la cabeza' },
];

const currentShape = ref<ShapeType>('sphere');
const resetRotationTrigger = ref(0);

export function useShapeState() {
  const setShape = (shape: ShapeType) => {
    currentShape.value = shape;
  };

  const triggerResetRotation = () => {
    resetRotationTrigger.value++;
  };

  return {
    currentShape: readonly(currentShape),
    resetRotationTrigger: readonly(resetRotationTrigger),
    catalog: SHAPES_CATALOG,
    setShape,
    triggerResetRotation,
  };
}
