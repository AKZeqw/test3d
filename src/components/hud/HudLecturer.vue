<script setup lang="ts">
import type { InvestigationObject } from '../../types/investigation'

const presetColors = [
  '#f59e0b',
  '#38bdf8',
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#a855f7',
  '#ec4899',
  '#64748b',
]

const props = defineProps<{
  selectedObject: InvestigationObject | null
  selectedId: string | null
  transformMode: 'translate' | 'rotate' | 'scale'
  showObjectList: boolean
  objects: InvestigationObject[]
}>()

const emit = defineEmits<{
  (e: 'update:transformMode', mode: 'translate' | 'rotate' | 'scale'): void
  (e: 'closeInspector'): void
  (e: 'selectObject', id: string): void
  (e: 'closeObjectList'): void
  (e: 'duplicateObject'): void
  (e: 'deleteObject'): void
  (e: 'snapToTable'): void
  (e: 'updatePosition', axis: number, value: number): void
  (e: 'updateRotationY', degrees: number): void
  (e: 'updateScale', scale: number): void
}>()
</script>

<template>
  <div class="hud-lecturer-container">
    <!-- Gizmo Mode Switcher -->
    <div v-if="selectedObject" class="gizmo-mode-bar">
      <span class="gizmo-label">Mode Pengatur:</span>
      <button
        :class="['mode-btn', { active: transformMode === 'translate' }]"
        @click="emit('update:transformMode', 'translate')"
      >
        ↔️ Geser
      </button>
      <button
        :class="['mode-btn', { active: transformMode === 'rotate' }]"
        @click="emit('update:transformMode', 'rotate')"
      >
        🔄 Putar
      </button>
      <button
        :class="['mode-btn', { active: transformMode === 'scale' }]"
        @click="emit('update:transformMode', 'scale')"
      >
        🔲 Skala
      </button>
    </div>

    <!-- Drawer Daftar Objek Dosen -->
    <div v-if="showObjectList" class="object-list-drawer">
      <div class="drawer-header">
        <h3>Daftar Objek di Ruangan</h3>
        <button class="close-btn" @click="emit('closeObjectList')">✕</button>
      </div>
      <div class="drawer-items">
        <div
          v-for="item in objects"
          :key="item.id"
          :class="['drawer-item', { active: selectedId === item.id }]"
          @click="emit('selectObject', item.id)"
        >
          <span
            class="item-color-tag"
            :style="{
              backgroundColor: item.type === 'custom_model' ? '#6366f1' : item.color,
            }"
          ></span>
          <div class="item-text">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-pos">
              Pos: [{{ item.position[0] }}, {{ item.position[1] }}, {{ item.position[2] }}]
            </span>
          </div>
          <span v-if="selectedId === item.id" class="item-active-check">✓</span>
        </div>
      </div>
    </div>

    <!-- Panel Inspektur Objek Dosen (Sisi Kanan) -->
    <aside v-if="selectedObject" class="inspector-card">
      <div class="inspector-header">
        <div class="inspector-title-area">
          <span
            :class="['badge-type', { 'badge-custom': selectedObject.type === 'custom_model' }]"
          >
            {{
              selectedObject.type === 'custom_model'
                ? '3D MODEL'
                : selectedObject.type.toUpperCase()
            }}
          </span>
          <h2>{{ selectedObject.name }}</h2>
        </div>
        <button class="close-btn" @click="emit('closeInspector')" title="Tutup">✕</button>
      </div>

      <div class="inspector-body">
        <p class="object-desc">{{ selectedObject.desc }}</p>

        <!-- CATATAN DOSEN UNTUK MAHASISWA -->
        <div class="control-group notes-group">
          <div class="group-header">
            <h3>👨‍🏫 Catatan / Petunjuk Kasus</h3>
          </div>
          <p class="group-hint">Tuliskan petunjuk yang akan dibaca mahasiswa saat memeriksa bukti ini:</p>
          <textarea
            v-model="selectedObject.notes"
            class="dosen-notes-input"
            rows="3"
            placeholder="Contoh: Ditemukan sidik jari parsial pada sisi kiri objek ini..."
          ></textarea>
        </div>

        <!-- KONTROL POSISI -->
        <div class="control-group">
          <div class="group-header">
            <h3>📍 Posisi (Koordinat)</h3>
            <button
              class="mini-snap-btn"
              @click="emit('snapToTable')"
              title="Ratakan tepat di atas meja"
            >
              ⬆️ Atas Meja
            </button>
          </div>

          <div class="coord-row">
            <span class="coord-axis axis-x">X</span>
            <input
              type="range"
              min="-3.5"
              max="3.5"
              step="0.05"
              :value="selectedObject.position[0]"
              @input="emit('updatePosition', 0, Number(($event.target as HTMLInputElement).value))"
            />
            <input
              type="number"
              step="0.1"
              class="coord-num-input"
              :value="selectedObject.position[0]"
              @change="emit('updatePosition', 0, Number(($event.target as HTMLInputElement).value))"
            />
          </div>

          <div class="coord-row">
            <span class="coord-axis axis-y">Y</span>
            <input
              type="range"
              min="0.0"
              max="4.0"
              step="0.05"
              :value="selectedObject.position[1]"
              @input="emit('updatePosition', 1, Number(($event.target as HTMLInputElement).value))"
            />
            <input
              type="number"
              step="0.1"
              class="coord-num-input"
              :value="selectedObject.position[1]"
              @change="emit('updatePosition', 1, Number(($event.target as HTMLInputElement).value))"
            />
          </div>

          <div class="coord-row">
            <span class="coord-axis axis-z">Z</span>
            <input
              type="range"
              min="-2.5"
              max="2.5"
              step="0.05"
              :value="selectedObject.position[2]"
              @input="emit('updatePosition', 2, Number(($event.target as HTMLInputElement).value))"
            />
            <input
              type="number"
              step="0.1"
              class="coord-num-input"
              :value="selectedObject.position[2]"
              @change="emit('updatePosition', 2, Number(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>

        <!-- KONTROL ROTASI & SKALA -->
        <div class="control-group">
          <h3>🔄 Rotasi & Ukuran</h3>
          <div class="coord-row">
            <span class="coord-axis">Putar</span>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              :value="Math.round(((selectedObject.rotation[1] % (2 * Math.PI)) * 180) / Math.PI)"
              @input="emit('updateRotationY', Number(($event.target as HTMLInputElement).value))"
            />
            <span class="val-display">
              {{ Math.round(((selectedObject.rotation[1] % (2 * Math.PI)) * 180) / Math.PI) }}°
            </span>
          </div>

          <div class="coord-row">
            <span class="coord-axis">Skala</span>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              :value="selectedObject.scale[0]"
              @input="emit('updateScale', Number(($event.target as HTMLInputElement).value))"
            />
            <span class="val-display">{{ selectedObject.scale[0] }}x</span>
          </div>
        </div>

        <!-- PILIHAN WARNA (Hanya untuk objek geometri) -->
        <div v-if="selectedObject.type !== 'custom_model'" class="control-group">
          <h3>🎨 Warna Bukti</h3>
          <div class="color-palette">
            <button
              v-for="c in presetColors"
              :key="c"
              :style="{ backgroundColor: c }"
              :class="['color-swatch', { active: selectedObject.color === c }]"
              @click="selectedObject.color = c"
            />
          </div>
        </div>

        <!-- AKSI OBJEK -->
        <div class="inspector-actions">
          <button class="action-btn secondary-btn" @click="emit('duplicateObject')">
            📋 Salin Objek
          </button>
          <button class="action-btn danger-btn" @click="emit('deleteObject')">
            🗑️ Hapus Objek
          </button>
        </div>
      </div>
    </aside>

    <!-- Footer Dosen -->
    <footer class="hud-footer">
      <div class="instruction-pill">
        <span>🖱️ <b>Klik Kiri + Geser:</b> Putar Sudut Pandang Orbit</span>
        <span>🔍 <b>Scroll:</b> Zoom Kamera</span>
        <span>🎯 <b>Klik Objek / Karakter:</b> Geser & Atur Posisi</span>
        <span>🦴 <b>Rigging Karakter:</b> Tampilkan Rangka Tulang & Animasi</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hud-lecturer-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* ================= GIZMO MODE BAR ================= */
.gizmo-mode-bar {
  position: absolute;
  top: 76px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(99, 102, 241, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 20;
  pointer-events: auto;
}

.gizmo-label {
  font-size: 11px;
  font-weight: 700;
  color: #818cf8;
  letter-spacing: 0.5px;
  margin-right: 6px;
}

.mode-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.mode-btn.active {
  background: #6366f1;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.5);
}

/* ================= PANEL INSPEKTUR OBJEK (DOSEN) ================= */
.inspector-card {
  position: absolute;
  top: 76px;
  right: 20px;
  width: 320px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 18px;
  color: #f8fafc;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  z-index: 20;
  pointer-events: auto;
  animation: fadeInRight 0.25s ease-out;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.badge-type {
  font-size: 10px;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.badge-custom {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

.inspector-header h2 {
  font-size: 16px;
  margin: 6px 0 0 0;
  color: #f8fafc;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.object-desc {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 14px 0;
  line-height: 1.4;
}

.control-group {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.control-group h3 {
  font-size: 12px;
  font-weight: 700;
  color: #cbd5e1;
  margin: 0 0 8px 0;
  letter-spacing: 0.3px;
}

.group-header h3 {
  margin: 0;
}

.group-hint {
  font-size: 11px;
  color: #94a3b8;
  margin: 0 0 8px 0;
}

.dosen-notes-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  padding: 8px 10px;
  color: #f1f5f9;
  font-size: 12px;
  line-height: 1.4;
  resize: vertical;
  box-sizing: border-box;
}

.dosen-notes-input:focus {
  outline: none;
  border-color: #6366f1;
}

.mini-snap-btn {
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.5);
  color: #c7d2fe;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.mini-snap-btn:hover {
  background: #6366f1;
  color: #ffffff;
}

.coord-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.coord-axis {
  width: 20px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  color: #94a3b8;
}

.axis-x {
  color: #f87171;
}
.axis-y {
  color: #4ade80;
}
.axis-z {
  color: #60a5fa;
}

.coord-row input[type='range'] {
  flex: 1;
  height: 5px;
  border-radius: 5px;
  accent-color: #6366f1;
  cursor: pointer;
}

.coord-num-input {
  width: 52px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f8fafc;
  font-size: 11px;
  padding: 4px 6px;
  text-align: center;
}

.val-display {
  font-size: 11px;
  color: #94a3b8;
  width: 38px;
  text-align: right;
  font-weight: 600;
}

.color-palette {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}
.color-swatch:hover {
  transform: scale(1.15);
}
.color-swatch.active {
  border-color: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.inspector-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  width: 100%;
  justify-content: center;
}

.secondary-btn {
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(12px);
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.12);
}
.secondary-btn:hover {
  background: rgba(51, 65, 85, 0.95);
  color: #ffffff;
}

.danger-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}
.danger-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

/* ================= DRAWER DAFTAR OBJEK ================= */
.object-list-drawer {
  position: absolute;
  top: 76px;
  left: 20px;
  width: 280px;
  max-height: calc(100vh - 150px);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 16px;
  color: #f8fafc;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  z-index: 20;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-header h3 {
  font-size: 14px;
  margin: 0;
  font-weight: 700;
}

.drawer-items {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.drawer-item:hover {
  background: rgba(51, 65, 85, 0.7);
}

.drawer-item.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.2);
}

.item-color-tag {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 12px;
  font-weight: 600;
}

.item-pos {
  font-size: 10px;
  color: #94a3b8;
}

.item-active-check {
  color: #6366f1;
  font-weight: 800;
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

@media (max-width: 768px) {
  .inspector-card {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
}
</style>
