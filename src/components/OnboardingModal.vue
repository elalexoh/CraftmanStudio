<script setup lang="ts">
import { useI18n } from '../composables/useI18n';
import {
  X,
  Compass,
  Move3d,
  MousePointerClick,
  Ruler,
  Lasso,
  ExternalLink,
  CheckCircle2
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { currentLanguage } = useI18n();

function closeGuide() {
  try {
    localStorage.setItem('craftsman_onboarding_seen', 'true');
  } catch (e) {
    // ignore
  }
  emit('close');
}
</script>

<template>
  <div class="guide-backdrop" @click.self="closeGuide">
    <div class="guide-panel">
      <!-- 1. Header -->
      <div class="guide-header">
        <div class="header-branding">
          <div class="header-icon-badge">
            <Compass :size="18" />
          </div>
          <div>
            <h2 class="guide-title">
              {{ currentLanguage === 'ja' ? 'Craftsman Studio クイックガイド' : currentLanguage === 'en' ? 'Craftsman Studio Quick Guide' : 'Guía Rápida de Craftsman Studio' }}
            </h2>
            <p class="guide-subtitle">
              {{ currentLanguage === 'ja' ? '3Dカメラ操作と隠れたショートカット操作' : currentLanguage === 'en' ? 'Core 3D navigation & essential gestures' : 'Controles esenciales de cámara 3D y gestos en el lienzo' }}
            </p>
          </div>
        </div>
        <button class="btn-close" title="Cerrar" @click="closeGuide">
          <X :size="16" />
        </button>
      </div>

      <!-- 2. Quick Cards Grid -->
      <div class="guide-grid">
        <!-- 1. Camara 3D -->
        <div class="quick-card">
          <div class="card-icon-wrap">
            <Move3d :size="16" />
          </div>
          <div class="card-content">
            <h4 class="card-title">
              {{ currentLanguage === 'ja' ? '3Dカメラ操作（回転＆ズーム）' : currentLanguage === 'en' ? '3D Camera Orbit & Zoom' : 'Cámara 3D: Rotación y Zoom' }}
            </h4>
            <ul class="card-list">
              <li>
                <strong>{{ currentLanguage === 'ja' ? '回転:' : currentLanguage === 'en' ? 'Rotate:' : 'Rotar:' }}</strong>
                {{ currentLanguage === 'ja' ? '右クリックドラッグ（または2本指タッチ）' : currentLanguage === 'en' ? 'Right-click + drag (or 2-finger touch)' : 'Clic derecho + arrastrar (o 2 dedos en táctil)' }}
              </li>
              <li>
                <strong>{{ currentLanguage === 'ja' ? 'ズーム:' : currentLanguage === 'en' ? 'Zoom:' : 'Zoom / Alejar:' }}</strong>
                {{ currentLanguage === 'ja' ? 'マウスホイール回転（またはピンチ操作）' : currentLanguage === 'en' ? 'Mouse wheel scroll (or pinch to zoom)' : 'Rueda del ratón (o pellizcar en táctil)' }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 2. Gestos de Pincel -->
        <div class="quick-card">
          <div class="card-icon-wrap">
            <MousePointerClick :size="16" />
          </div>
          <div class="card-content">
            <h4 class="card-title">
              {{ currentLanguage === 'ja' ? '直感ジェスチャー' : currentLanguage === 'en' ? 'Dynamic Canvas Gestures' : 'Gestos Rápidos de Pincel' }}
            </h4>
            <ul class="card-list">
              <li>
                <strong>Ctrl + Alt + Arrastre:</strong>
                {{ currentLanguage === 'ja' ? 'ブラシサイズをリアルタイムに変更' : currentLanguage === 'en' ? 'Resize brush size live on canvas' : 'Cambia el grosor del pincel en vivo' }}
              </li>
              <li>
                <strong>{{ currentLanguage === 'ja' ? 'Alt長押し:' : currentLanguage === 'en' ? 'Hold Alt:' : 'Mantener Alt:' }}</strong>
                {{ currentLanguage === 'ja' ? '一時的にスポイトで色を取得' : currentLanguage === 'en' ? 'Temporary eyedropper to sample color' : 'Cuentagotas temporal para muestrear color' }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 3. Reglas 360 -->
        <div class="quick-card">
          <div class="card-icon-wrap">
            <Ruler :size="16" />
          </div>
          <div class="card-content">
            <h4 class="card-title">
              {{ currentLanguage === 'ja' ? 'パース定規（Rキー）' : currentLanguage === 'en' ? 'Smart 360° Rulers (R Key)' : 'Reglas Guía 360° (Tecla R)' }}
            </h4>
            <ul class="card-list">
              <li>
                <strong>{{ currentLanguage === 'ja' ? '垂直定規:' : currentLanguage === 'en' ? 'Vertical:' : 'Vertical:' }}</strong>
                {{ currentLanguage === 'ja' ? '垂直な柱や壁を歪みなく描画' : currentLanguage === 'en' ? 'Straight vertical columns & walls' : 'Líneas verticales puras de polo a polo' }}
              </li>
              <li>
                <strong>{{ currentLanguage === 'ja' ? '水平定規:' : currentLanguage === 'en' ? 'Horizontal:' : 'Horizontal:' }}</strong>
                {{ currentLanguage === 'ja' ? '360°の緯度・地平線の曲率に沿う' : currentLanguage === 'en' ? 'Curves along spherical latitude & horizon' : 'Sigue la curvatura de latitud y horizonte' }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 4. Lazo y Atajos -->
        <div class="quick-card">
          <div class="card-icon-wrap">
            <Lasso :size="16" />
          </div>
          <div class="card-content">
            <h4 class="card-title">
              {{ currentLanguage === 'ja' ? '選択ツール（Lキー）' : currentLanguage === 'en' ? 'Selection & Masks (L Key)' : 'Lazo y Máscaras (Tecla L)' }}
            </h4>
            <ul class="card-list">
              <li>
                <strong>Ctrl + D:</strong> {{ currentLanguage === 'ja' ? '選択解除' : currentLanguage === 'en' ? 'Deselect' : 'Deseleccionar' }}
                &nbsp;|&nbsp;
                <strong>Ctrl + Shift + I:</strong> {{ currentLanguage === 'ja' ? '反転' : currentLanguage === 'en' ? 'Invert' : 'Invertir' }}
              </li>
              <li>
                <strong>Supr / Delete:</strong> {{ currentLanguage === 'ja' ? '選択領域を消去' : currentLanguage === 'en' ? 'Clear selected area' : 'Limpiar el área seleccionada' }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 3. Primary Action Block (Above Disclaimers) -->
      <div class="guide-action-row">
        <button class="btn-primary-action" @click="closeGuide">
          <CheckCircle2 :size="15" />
          <span>{{ currentLanguage === 'ja' ? '理解しました' : currentLanguage === 'en' ? 'Got it!' : '¡Entendido!' }}</span>
        </button>
      </div>

      <!-- 4. Disclaimers & Credits Bar (Cleanly separated at bottom) -->
      <div class="guide-disclaimers-row">
        <div class="credit-item">
          <span>👺 Desarrollador: <strong>Deeply Oku</strong></span>
          <a
            href="https://deeply-portfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            class="credit-link"
          >
            <span>Portafolio</span>
            <ExternalLink :size="10" />
          </a>
        </div>

        <div class="credit-item inspiration-item">
          <span>Inspirado en</span>
          <a
            href="https://tools.neco-sara.com/tools/gururi-paint/"
            target="_blank"
            rel="noopener noreferrer"
            class="credit-link"
          >
            <span>ぐるりペイント (neco-sara)</span>
            <ExternalLink :size="10" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.guide-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.guide-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  width: 100%;
  max-width: 620px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #334155;
}

.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.header-branding {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}

.guide-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.guide-subtitle {
  font-size: 11px;
  color: #64748b;
  margin: 1px 0 0;
}

.btn-close {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 14px 16px 10px;
  background: #ffffff;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    max-height: 55vh;
    overflow-y: auto;
  }
}

.quick-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.card-icon-wrap {
  padding: 6px;
  border-radius: 6px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.card-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 11px;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1.35;

  li {
    strong {
      color: #0f172a;
    }
  }
}

/* 3. Dedicated Action Row (Above Disclaimers) */
.guide-action-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px 12px;
  background: #ffffff;
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 7px 18px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #1d4ed8;
  }
}

/* 4. Dedicated Disclaimers Row (At Bottom) */
.guide-disclaimers-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
  color: #64748b;
  gap: 8px;
  flex-wrap: wrap;

  strong {
    color: #1e293b;
  }
}

.credit-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.credit-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #2563eb;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s ease;

  &:hover {
    color: #1d4ed8;
  }
}
</style>
