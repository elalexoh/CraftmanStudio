import { ref, readonly, computed } from 'vue';
import type { SphericalLightState } from '../three/types/scene';

const lightState = ref<SphericalLightState>({
  azimuth: 45, // 45 grados horizontal
  elevation: 45, // 45 grados vertical
  distance: 5.5, // Radio de órbita
  intensity: 35, // Intensidad lumínica
  color: '#ffffff',
});

export function useLightingState() {
  const setAzimuth = (azimuth: number) => {
    // Normalizar a 0 - 360
    lightState.value.azimuth = ((azimuth % 360) + 360) % 360;
  };

  const setElevation = (elevation: number) => {
    // Clamping entre -80 y 80 grados
    lightState.value.elevation = Math.max(-80, Math.min(80, elevation));
  };

  const setDistance = (distance: number) => {
    lightState.value.distance = Math.max(1.5, Math.min(15, distance));
  };

  const setIntensity = (intensity: number) => {
    lightState.value.intensity = Math.max(0, Math.min(100, intensity));
  };

  const setColor = (color: string) => {
    lightState.value.color = color;
  };

  const setPositionSpherical = (azimuth: number, elevation: number) => {
    setAzimuth(azimuth);
    setElevation(elevation);
  };

  // Conversión a coordenadas cartesianas [x, y, z]
  const cartesianPosition = computed<[number, number, number]>(() => {
    const azRad = (lightState.value.azimuth * Math.PI) / 180;
    const elRad = (lightState.value.elevation * Math.PI) / 180;
    const dist = lightState.value.distance;

    const x = dist * Math.cos(elRad) * Math.sin(azRad);
    const y = dist * Math.sin(elRad);
    const z = dist * Math.cos(elRad) * Math.cos(azRad);

    return [x, y, z];
  });

  return {
    lightState: readonly(lightState),
    cartesianPosition,
    setAzimuth,
    setElevation,
    setDistance,
    setIntensity,
    setColor,
    setPositionSpherical,
  };
}
