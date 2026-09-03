<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  useCameraPresets,
  type AxonometricPreset,
} from '../composables/useCameraPresets';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  Bookmark,
  RotateCcw,
  Sparkles,
  Maximize2,
  Lock,
  Layers,
  Save,
  Check
} from 'lucide-vue-next';

const {
  currentPreset,
  orientation,
  bookmarks,
  isShiftSnapActive,
  isPresetsPanelOpen,
  setPreset,
  setOrientation,
  saveBookmark,
  loadBookmark,
  togglePresetsPanel,
} = useCameraPresets();

const isCollapsed = ref(false);
const savedSlotId = ref<number | null>(null);

const presetsList: { id: AxonometricPreset; label: string; desc: string }[] = [
  { id: 'isometric', label: 'Isométrica', desc: '30° / 30° - Ejes 1:1:1' },
  { id: 'dimetric', label: 'Dimétrica', desc: '15° / 15° - Relación 1:1:0.5' },
  { id: 'cavalier', label: 'Caballera', desc: 'Frontal 90°, oblicuo 45°' },
  { id: 'military', label: 'Militar', desc: 'Planta a 45°, eje Z vertical' },
  { id: 'free', label: 'Libre', desc: 'Órbita y orientación continua' },
];

const handleYawChange = (val: number | string) => {
  const num = Number(val);
  if (!isNaN(num)) {
    setOrientation(num, orientation.pitch, orientation.roll, false);
  }
};

const handlePitchChange = (val: number | string) => {
  const num = Number(val);
  if (!isNaN(num)) {
    setOrientation(orientation.yaw, num, orientation.roll, false);
  }
};

const handleRollChange = (val: number | string) => {
  const num = Number(val);
  if (!isNaN(num)) {
    setOrientation(orientation.yaw, orientation.pitch, num, false);
  }
};

const stepAngle = (axis: 'yaw' | 'pitch' | 'roll', delta: number) => {
  if (axis === 'yaw') {
    setOrientation(orientation.yaw + delta, orientation.pitch, orientation.roll, true);
  } else if (axis === 'pitch') {
    setOrientation(orientation.yaw, orientation.pitch + delta, orientation.roll, true);
  } else if (axis === 'roll') {
    setOrientation(orientation.yaw, orientation.pitch, orientation.roll + delta, true);
  }
};

const handleSaveSlot = (slotId: number) => {
  saveBookmark(slotId);
  savedSlotId.value = slotId;
  setTimeout(() => {
    savedSlotId.value = null;
  }, 1200);
};
</script>

<template>
  <div
    v-if="isPresetsPanelOpen"
    class="fixed top-14 right-4 z-40 w-72 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/60 rounded-xl shadow-2xl text-zinc-100 overflow-hidden transition-all duration-200"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-3.5 py-2.5 bg-zinc-800/60 border-b border-zinc-700/50 cursor-pointer select-none"
      @click="isCollapsed = !isCollapsed"
    >
      <div class="flex items-center gap-2">
        <Compass class="w-4 h-4 text-cyan-400" />
        <span class="text-xs font-semibold tracking-wide text-zinc-200">Inclinación & Proyección</span>
      </div>
      <div class="flex items-center gap-1.5">
        <button
          class="text-zinc-400 hover:text-zinc-100 p-1 rounded hover:bg-zinc-700/50 transition-colors"
          :title="isCollapsed ? 'Expandir' : 'Colapsar'"
        >
          <ChevronUp v-if="!isCollapsed" class="w-3.5 h-3.5" />
          <ChevronDown v-else class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Body -->
    <div v-show="!isCollapsed" class="p-3 space-y-3.5 max-h-[75vh] overflow-y-auto custom-scrollbar">
      <!-- Presets Selector Grid -->
      <div>
        <label class="text-[11px] font-medium text-zinc-400 block mb-1.5">Proyección Axonométrica</label>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="p in presetsList"
            :key="p.id"
            @click="setPreset(p.id)"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition-all flex flex-col justify-center"
            :class="[
              currentPreset === p.id
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/10'
                : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600',
              p.id === 'free' ? 'col-span-2 text-center' : ''
            ]"
            :title="p.desc"
          >
            <span>{{ p.label }}</span>
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-zinc-800" />

      <!-- Numerical Euler Angle Controls -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <label class="text-[11px] font-medium text-zinc-400">Ajuste Preciso (Grados)</label>
          <span class="text-[10px] text-zinc-500">Snap 15° con Shift</span>
        </div>

        <!-- Yaw (Azimut) -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Azimut (Yaw):</span>
            <div class="flex items-center gap-1">
              <button
                @click="stepAngle('yaw', -15)"
                class="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300"
                title="-15°"
              >-15°</button>
              <input
                type="number"
                :value="Math.round(orientation.yaw)"
                @input="handleYawChange(($event.target as HTMLInputElement).value)"
                class="w-14 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-center text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span class="text-zinc-500 text-[10px]">°</span>
              <button
                @click="stepAngle('yaw', 15)"
                class="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300"
                title="+15°"
              >+15°</button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            :value="Math.round(orientation.yaw)"
            @input="handleYawChange(($event.target as HTMLInputElement).value)"
            class="w-full accent-cyan-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        <!-- Pitch (Elevación) -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Elevación (Pitch):</span>
            <div class="flex items-center gap-1">
              <button
                @click="stepAngle('pitch', -15)"
                class="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300"
                title="-15°"
              >-15°</button>
              <input
                type="number"
                :value="Math.round(orientation.pitch)"
                @input="handlePitchChange(($event.target as HTMLInputElement).value)"
                class="w-14 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-center text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span class="text-zinc-500 text-[10px]">°</span>
              <button
                @click="stepAngle('pitch', 15)"
                class="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300"
                title="+15°"
              >+15°</button>
            </div>
          </div>
          <input
            type="range"
            min="-89"
            max="89"
            :value="Math.round(orientation.pitch)"
            @input="handlePitchChange(($event.target as HTMLInputElement).value)"
            class="w-full accent-cyan-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        <!-- Roll (Inclinación Lateral) -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Inclinación (Roll):</span>
            <div class="flex items-center gap-1">
              <button
                @click="setOrientation(orientation.yaw, orientation.pitch, 0, true)"
                class="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-400 hover:text-zinc-200"
                title="Reset a 0°"
              >
                <RotateCcw class="w-2.5 h-2.5" />
              </button>
              <input
                type="number"
                :value="Math.round(orientation.roll)"
                @input="handleRollChange(($event.target as HTMLInputElement).value)"
                class="w-14 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-center text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span class="text-zinc-500 text-[10px]">°</span>
            </div>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            :value="Math.round(orientation.roll)"
            @input="handleRollChange(($event.target as HTMLInputElement).value)"
            class="w-full accent-cyan-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-zinc-800" />

      <!-- Bookmarks Slots -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-[11px] font-medium text-zinc-400">Bookmarks de Cámara</label>
          <span class="text-[10px] text-zinc-500">Slots 1 - 4</span>
        </div>
        <div class="grid grid-cols-4 gap-1.5">
          <div
            v-for="b in bookmarks"
            :key="b.id"
            class="group relative"
          >
            <button
              @click="loadBookmark(b.id)"
              class="w-full py-1 px-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-center font-mono font-medium transition-colors"
              :class="savedSlotId === b.id ? 'border-green-500 text-green-400 bg-green-500/10' : 'text-zinc-300'"
              :title="`Cargar Vista ${b.id} (${b.preset})`"
            >
              <span v-if="savedSlotId === b.id" class="flex items-center justify-center gap-0.5">
                <Check class="w-3 h-3 text-green-400" />
              </span>
              <span v-else>#{{ b.id }}</span>
            </button>
            <!-- Save Button Hover -->
            <button
              @click.stop="handleSaveSlot(b.id)"
              class="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow"
              :title="`Guardar vista actual en Slot #${b.id}`"
            >
              <Save class="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
