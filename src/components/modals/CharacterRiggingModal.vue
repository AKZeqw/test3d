<script setup lang="ts">
import type { useCharacterRigging } from '../../composables/useCharacterRigging'

const props = defineProps<{
  rig: ReturnType<typeof useCharacterRigging>
}>()

const {
  showRiggingPanel,
  characterModelType,
  characterPosition,
  characterRotation,
  showSkeletonRig,
  isCharacterLoading,
  availableAnimations,
  currentAnimationName,
  animationSpeed,
  isAnimationPlaying,
  totalBonesCount,
  skeletonName,
  quickAnimationPresets,
  loadRiggedCharacter,
  playCharacterAnimation,
  toggleSkeletonRig,
  setAnimationPlaybackSpeed,
  togglePlayPauseAnimation,
} = props.rig
</script>

<template>
  <!-- ================= MODAL / PANEL CHARACTER RIGGING ================= -->
  <div v-if="showRiggingPanel" class="rigging-studio-panel">
    <div class="rigging-header">
      <div class="rigging-title-row">
        <span class="rigging-icon">🦴</span>
        <div>
          <h3>Character Rigging Studio</h3>
          <p class="rigging-subtitle">Skeletal Joints & Controller Animasi 3D</p>
        </div>
      </div>
      <button class="close-btn" @click="showRiggingPanel = false" title="Tutup">✕</button>
    </div>

    <div class="rigging-body">
      <!-- Status Skeleton & Model Rigging -->
      <div class="rig-status-card">
        <div class="rig-status-item">
          <span class="stat-label">Pilih Karakter:</span>
          <div class="avatar-switch-btns">
            <button
              :class="['avatar-btn', { active: characterModelType === 'player1' }]"
              @click="loadRiggedCharacter('player1')"
              :disabled="isCharacterLoading"
            >
              👨‍💼 Detektif Alex
            </button>
            <button
              :class="['avatar-btn', { active: characterModelType === 'player2' }]"
              @click="loadRiggedCharacter('player2')"
              :disabled="isCharacterLoading"
            >
              👩‍💼 Detektif Maya
            </button>
          </div>
        </div>

        <div class="rig-stats-row">
          <div class="rig-stat-pill">
            <span class="stat-key">Skeleton</span>
            <span class="stat-val">{{ skeletonName }}</span>
          </div>
          <div class="rig-stat-pill">
            <span class="stat-key">Sendi (Joints)</span>
            <span class="stat-val text-accent">{{ totalBonesCount }} Bones</span>
          </div>
          <div class="rig-stat-pill">
            <span class="stat-key">Klip Animasi</span>
            <span class="stat-val">{{ availableAnimations.length }} Klip</span>
          </div>
        </div>
      </div>

      <!-- Tombol Utama Visualisasi Skeleton Rigging -->
      <div class="rig-visualizer-card">
        <div class="visualizer-info">
          <span class="visualizer-title">🦴 Visualisasi Tulang Rangka (Skeleton Bones)</span>
          <span class="visualizer-desc">
            Tampilkan struktur sendi dan tulang rigging 3D yang bergerak secara real-time
          </span>
        </div>
        <button
          :class="['rig-toggle-btn', { active: showSkeletonRig }]"
          @click="toggleSkeletonRig"
        >
          <span class="toggle-indicator"></span>
          <span>{{ showSkeletonRig ? 'Bones Aktif' : 'Tampilkan Bones' }}</span>
        </button>
      </div>

      <!-- Pemutar Animasi & Kecepatan -->
      <div class="anim-controller-card">
        <div class="anim-header-row">
          <span class="card-section-title">🎬 Animasi Sedang Aktif:</span>
          <div class="anim-playback-controls">
            <button
              class="icon-playback-btn"
              @click="togglePlayPauseAnimation"
              :title="isAnimationPlaying ? 'Jeda Animasi' : 'Putar Animasi'"
            >
              {{ isAnimationPlaying ? '⏸️ Jeda' : '▶️ Lanjut' }}
            </button>
          </div>
        </div>
        <div class="current-anim-banner">
          <span class="anim-badge">ACTIVE</span>
          <span class="anim-name-display">{{ currentAnimationName }}</span>
        </div>

        <!-- Pilihan Kecepatan -->
        <div class="speed-slider-row">
          <span class="speed-label">Kecepatan Gerak: {{ animationSpeed }}x</span>
          <div class="speed-btns">
            <button
              v-for="spd in [0.5, 1.0, 1.5, 2.0]"
              :key="spd"
              :class="['speed-btn', { active: animationSpeed === spd }]"
              @click="setAnimationPlaybackSpeed(spd)"
            >
              {{ spd }}x
            </button>
          </div>
        </div>
      </div>

      <!-- Shortcut Pose & Gerakan Cepat -->
      <div class="quick-poses-section">
        <span class="card-section-title">✨ Pilihan Pose & Gerakan Cepat:</span>
        <div class="preset-anim-grid">
          <button
            v-for="p in quickAnimationPresets"
            :key="p.key"
            :class="['preset-anim-card', { active: currentAnimationName === p.key }]"
            @click="playCharacterAnimation(p.key)"
          >
            <span class="preset-anim-label">{{ p.label }}</span>
            <span class="preset-anim-desc">{{ p.desc }}</span>
          </button>
        </div>
      </div>

      <!-- Semua Animasi (Dropdown) -->
      <div class="all-anims-dropdown-group">
        <label class="card-section-title">📂 Semua 41 Animasi Rigging:</label>
        <select
          class="anim-select"
          :value="currentAnimationName"
          @change="playCharacterAnimation(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="anim in availableAnimations" :key="anim" :value="anim">
            {{ anim }}
          </option>
        </select>
      </div>

      <!-- Kontrol Posisi & Rotasi Karakter di TKP -->
      <div class="char-transform-group">
        <span class="card-section-title">📍 Posisi & Arah Karakter di Ruangan:</span>
        <div class="char-coord-grid">
          <div class="coord-field">
            <span>Sumbu X:</span>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              :value="characterPosition[0]"
              @input="characterPosition[0] = Number(($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="coord-field">
            <span>Sumbu Z:</span>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              :value="characterPosition[2]"
              @input="characterPosition[2] = Number(($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="coord-field">
            <span>Arah Putar:</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              :value="Math.round((characterRotation[1] * 180) / Math.PI)"
              @input="characterRotation[1] = (Number(($event.target as HTMLInputElement).value) * Math.PI) / 180"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.rigging-studio-panel {
  position: absolute;
  top: 76px;
  right: 20px;
  width: 380px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 85, 247, 0.35);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 25px rgba(168, 85, 247, 0.15);
  z-index: 50;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rigging-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 14px;
}

.rigging-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rigging-icon {
  font-size: 24px;
  background: rgba(168, 85, 247, 0.18);
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.rigging-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 2px 0;
}

.rigging-subtitle {
  font-size: 11px;
  color: #c084fc;
  margin: 0;
}

.rigging-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Status Card */
.rig-status-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rig-status-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avatar-switch-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.avatar-btn {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-btn:hover {
  background: rgba(51, 65, 85, 0.6);
  border-color: rgba(255, 255, 255, 0.2);
}

.avatar-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: #a78bfa;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.rig-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  background: rgba(15, 23, 42, 0.45);
  border-radius: 10px;
  padding: 8px;
}

.rig-stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-key {
  font-size: 9px;
  color: #94a3b8;
  text-transform: uppercase;
}

.stat-val {
  font-size: 11px;
  font-weight: 700;
  color: #f1f5f9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.text-accent {
  color: #38bdf8 !important;
}

/* Skeleton Visualizer Card */
.rig-visualizer-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.visualizer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.visualizer-title {
  font-size: 12px;
  font-weight: 700;
  color: #86efac;
}

.visualizer-desc {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.3;
}

.rig-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
  flex-shrink: 0;
}

.rig-toggle-btn.active {
  background: #22c55e;
  color: #052e16;
  border-color: #86efac;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
}

.toggle-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

/* Animation Controller Card */
.anim-controller-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anim-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.icon-playback-btn {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #c7d2fe;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-playback-btn:hover {
  background: #6366f1;
  color: white;
}

.current-anim-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 10px;
  padding: 8px 12px;
}

.anim-badge {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  background: #a855f7;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
}

.anim-name-display {
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
}

.speed-slider-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
}

.speed-label {
  font-size: 10px;
  color: #94a3b8;
}

.speed-btns {
  display: flex;
  gap: 4px;
}

.speed-btn {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  cursor: pointer;
}

.speed-btn.active {
  background: #6366f1;
  color: white;
  border-color: #818cf8;
}

/* Quick Poses Grid */
.quick-poses-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-anim-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
}

.preset-anim-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-anim-card:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: rgba(168, 85, 247, 0.35);
  transform: translateY(-1px);
}

.preset-anim-card.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.35));
  border-color: #a855f7;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
}

.preset-anim-label {
  font-size: 11px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.preset-anim-desc {
  font-size: 9px;
  color: #94a3b8;
  line-height: 1.2;
}

/* Dropdown */
.all-anims-dropdown-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.anim-select {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f1f5f9;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 12px;
  outline: none;
}

.anim-select option {
  background: #0f172a;
  color: #f1f5f9;
}

/* Character Coordinates */
.char-transform-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  padding: 10px;
}

.char-coord-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coord-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  color: #94a3b8;
}

.coord-field input[type='range'] {
  flex: 1;
  accent-color: #a855f7;
}

@media (max-width: 768px) {
  .rigging-studio-panel {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
}
</style>
