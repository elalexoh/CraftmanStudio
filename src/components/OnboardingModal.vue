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

const { t, currentLanguage } = useI18n();

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
    <div class="guide-card">
      <!-- Header -->
      <div class="guide-header">
        <div class="header-branding">
          <div class="header-icon-badge">
            <Compass :size="20" />
          </div>
          <div>
            <h2 class="guide-title">
              {{ currentLanguage === 'ja' ? 'Craftsman Studio クイックガイド' : currentLanguage === 'en' ? 'Craftsman Studio Quick Guide' : 'Guía Rápida de Craftsman Studio' }}
            </h2>
            <p class="guide-subtitle">
              {{ currentLanguage === 'ja' ? '3Dカメラ操作と隠れたショートカット操作' : currentLanguage === 'en' ? 'Core 3D navigation & essential gestures' : 'Controles esenciales de cámara 3D y gestos ocultos' }}
            </p>
          </div>
        </div>
        <button class="close-btn" title="Cerrar" @click="closeGuide">
          <X :size="18" />
        </button>
      </div>

      <!-- Quick Cards Grid -->
      <div class="guide-grid">
        <!-- 1. Camara 3D -->
        <div class="quick-card">
          <div class="card-icon-wrap" style="color: #38bdf8; background: rgba(56, 189, 248, 0.12);">
            <Move3d :size="18" />
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
          <div class="card-icon-wrap" style="color: #a855f7; background: rgba(168, 85, 247, 0.12);">
            <MousePointerClick :size="18" />
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
          <div class="card-icon-wrap" style="color: #06b6d4; background: rgba(6, 182, 212, 0.12);">
            <Ruler :size="18" />
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
          <div class="card-icon-wrap" style="color: #ec4899; background: rgba(236, 72, 153, 0.12);">
            <Lasso :size="18" />
          </div>
          <div class="card-content">
            <h4 class="card-title">
              {{ currentLanguage === 'ja' ? '選択ツール（Lキー）' : currentLanguage === 'en' ? 'Selection & Masks (L Key)' : 'Lazo y Máscaras (Tecla L)' }}
            </h4>
            <ul class="card-list">
              <li>
                <strong>Ctrl + D:</strong> {{ currentLanguage === 'ja' ? '選択解除' : currentLanguage === 'en' ? 'Deselect' : 'Deseleccionar área' }}
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

      <!-- Developer & Inspiration Footer Bar -->
      <div class="guide-footer">
        <div class="dev-banner">
          <span class="dev-icon">👺</span>
          <span class="dev-text">
            {{ currentLanguage === 'ja' ? '開発者:' : currentLanguage === 'en' ? 'Developed by:' : 'Desarrollado por:' }}
            <strong>Frederick A. Gonzalez</strong>
          </span>
          <a
            href="https://deeply-portfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            class="dev-portfolio-link"
          >
            <span>{{ currentLanguage === 'ja' ? 'ポートフォリオ' : currentLanguage === 'en' ? 'Portfolio' : 'Portafolio' }}</span>
            <ExternalLink :size="11" />
          </a>
          <span class="credit-sep">•</span>
          <span class="inspiration-text">
            {{ currentLanguage === 'ja' ? '着想元:' : currentLanguage === 'en' ? 'Inspired by:' : 'Inspirado en:' }}
            <a
              href="https://tools.neco-sara.com/tools/gururi-paint/"
              target="_blank"
              rel="noopener noreferrer"
              class="inspiration-link"
            >
              ぐるりペイント (neco-sara)
            </a>
          </span>
        </div>

        <button class="btn-understand" @click="closeGuide">
          <CheckCircle2 :size="16" />
          <span>{{ currentLanguage === 'ja' ? '理解しました' : currentLanguage === 'en' ? 'Got it!' : '¡Entendido!' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.guide-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.guide-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  width: 100%;
  max-width: 660px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f8fafc;
}

.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.4rem 0.85rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.6);
}

.header-branding {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.guide-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
}

.guide-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 2px 0 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: #334155;
    color: #f8fafc;
  }
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 1.15rem 1.4rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    max-height: 60vh;
    overflow-y: auto;
  }
}

.quick-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 0.85rem 0.95rem;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.card-icon-wrap {
  padding: 7px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.35rem;
}

.card-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1.35;

  li {
    strong {
      color: #e2e8f0;
    }
  }
}

.guide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.4rem;
  background: #0f172a;
  border-top: 1px solid rgba(51, 65, 85, 0.8);
  flex-wrap: wrap;
  gap: 10px;
}

.dev-banner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #cbd5e1;

  .dev-icon {
    font-size: 1.1rem;
  }

  strong {
    color: #ffffff;
  }
}

.dev-portfolio-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  margin-left: 2px;
  transition: all 0.15s ease;

  &:hover {
    background: #6366f1;
    color: #ffffff;
  }
}

.credit-sep {
  color: #475569;
  margin: 0 2px;
}

.inspiration-text {
  font-size: 0.75rem;
  color: #94a3b8;
}

.inspiration-link {
  color: #38bdf8;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;

  &:hover {
    color: #7dd3fc;
  }
}

.btn-understand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
}
</style>
