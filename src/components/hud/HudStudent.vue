<script setup lang="ts">
import type { InvestigationObject } from '../../types/investigation'

defineProps<{
  nearbyObject: InvestigationObject | null
  inspectedCount: number
  totalCount: number
}>()

const emit = defineEmits<{
  (e: 'openDossier', obj: InvestigationObject): void
}>()
</script>

<template>
  <div class="student-hud-container">
    <!-- Crosshair / Reticle di Tengah Layar -->
    <div :class="['student-reticle', { 'reticle-active': nearbyObject }]"></div>

    <!-- Prompt Interaksi Saat Mendekati Bukti -->
    <div
      v-if="nearbyObject"
      class="interaction-prompt"
      @click="emit('openDossier', nearbyObject)"
    >
      <span class="key-badge">E</span>
      <div class="prompt-text">
        <span class="prompt-action">Tekan tombol [E] untuk memeriksa</span>
        <span class="prompt-title">{{ nearbyObject.name }}</span>
      </div>
    </div>

    <!-- Kartu Progress Investigasi Mahasiswa (Kanan Atas) -->
    <div class="student-progress-card">
      <div class="progress-title-row">
        <span class="progress-badge">KASUS AKTIF</span>
        <span class="progress-ratio">{{ inspectedCount }} / {{ totalCount }} Bukti</span>
      </div>
      <div class="progress-bar-bg">
        <div
          class="progress-bar-fill"
          :style="{
            width: (totalCount > 0 ? (inspectedCount / totalCount) * 100 : 0) + '%',
          }"
        ></div>
      </div>
      <span class="progress-hint">
        {{
          inspectedCount === totalCount && totalCount > 0
            ? '🎉 Semua barang bukti telah diidentifikasi dan diverifikasi!'
            : 'Jelajahi ruangan untuk meneliti bukti dan petunjuk tersembunyi.'
        }}
      </span>
    </div>

    <!-- Bar Panduan Navigasi Berjalan (Bawah) -->
    <div class="hud-footer">
      <div class="instruction-pill student-pill">
        <span>🚶 <b>WASD</b> Berjalan</span>
        <span>🖱️ <b>Klik & Drag</b> Arah Pandang</span>
        <span>🔍 <b>[E]</b> Periksa Bukti Berkas</span>
        <span>❌ <b>[ESC]</b> Tutup Berkas</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-hud-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Reticle / Crosshair */
.student-reticle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 15;
  transition: all 0.2s ease;
}

.student-reticle.reticle-active {
  width: 16px;
  height: 16px;
  background-color: transparent;
  border: 2px solid #38bdf8;
  box-shadow: 0 0 12px #38bdf8;
  animation: pulseReticle 1s infinite alternate;
}

@keyframes pulseReticle {
  from {
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    transform: translate(-50%, -50%) scale(1.25);
  }
}

/* Prompt Interaksi [E] */
.interaction-prompt {
  position: absolute;
  top: 56%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(16px);
  border: 1px solid #38bdf8;
  box-shadow: 0 10px 30px rgba(56, 189, 248, 0.35);
  padding: 8px 18px;
  border-radius: 9999px;
  cursor: pointer;
  z-index: 25;
  pointer-events: auto;
  animation: bounceIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: translate(-50%, 15px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

.key-badge {
  background: #38bdf8;
  color: #0f172a;
  font-weight: 800;
  font-size: 14px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.prompt-text {
  display: flex;
  flex-direction: column;
}

.prompt-action {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.prompt-title {
  font-size: 13px;
  color: #f8fafc;
  font-weight: 700;
}

/* Card Progress Investigasi Mahasiswa */
.student-progress-card {
  position: absolute;
  top: 76px;
  right: 20px;
  width: 280px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  z-index: 20;
  pointer-events: auto;
}

.progress-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.progress-ratio {
  font-size: 12px;
  font-weight: 800;
  color: #38bdf8;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(51, 65, 85, 0.6);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8 0%, #6366f1 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-hint {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.3;
  display: block;
}

/* Footer / Instruction */
.hud-footer {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.instruction-pill {
  display: flex;
  gap: 16px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(14px);
  padding: 8px 18px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 11px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
}

.student-pill {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(56, 189, 248, 0.3);
}

@media (max-width: 768px) {
  .student-progress-card {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
}
</style>
