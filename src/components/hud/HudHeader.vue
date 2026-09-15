<script setup lang="ts">
import type { LightingMode, Role } from '../../types/investigation'

defineProps<{
  currentRole: Role
  objectsCount: number
  showRiggingPanel: boolean
  showSkeletonRig: boolean
  showMainTable: boolean
  showGridHelper: boolean
  lightingMode: LightingMode
}>()

const emit = defineEmits<{
  (e: 'switchRole', role: Role): void
  (e: 'triggerFileInput'): void
  (e: 'openAddModal'): void
  (e: 'toggleObjectList'): void
  (e: 'toggleRiggingPanel'): void
  (e: 'openAIGenerator'): void
  (e: 'toggleMainTable'): void
  (e: 'toggleGridHelper'): void
  (e: 'setLightingPreset', mode: LightingMode): void
}>()
</script>

<template>
  <!-- ================= HUD HEADER ================= -->
  <header class="hud-header">
    <div class="header-left">
      <!-- ROLE SELECTOR SWITCHER -->
      <div class="role-selector-pill">
        <button
          :class="['role-btn', { active: currentRole === 'dosen' }]"
          @click="emit('switchRole', 'dosen')"
          title="Mode Dosen: Kelola dan atur tata letak ruang investigasi"
        >
          👨‍🏫 Mode Dosen
        </button>
        <button
          :class="['role-btn', { active: currentRole === 'mahasiswa' }]"
          @click="emit('switchRole', 'mahasiswa')"
          title="Mode Mahasiswa: Berjalan langsung (WASD) dan telusuri bukti kasus"
        >
          👨‍🎓 Mode Mahasiswa
        </button>
      </div>

      <!-- Tombol Aksi Khusus Dosen -->
      <template v-if="currentRole === 'dosen'">
        <button
          class="action-btn upload-btn"
          @click="emit('triggerFileInput')"
          title="Upload file model 3D"
        >
          <span class="btn-icon">📤</span> Upload (.glb / .gltf)
        </button>
        <button class="action-btn primary-btn" @click="emit('openAddModal')">
          <span class="btn-icon">➕</span> Tambah Objek
        </button>
        <button class="action-btn secondary-btn" @click="emit('toggleObjectList')">
          <span class="btn-icon">📁</span> Daftar ({{ objectsCount }})
        </button>
        <button
          :class="['action-btn', 'rig-header-btn', { active: showRiggingPanel }]"
          @click="emit('toggleRiggingPanel')"
          title="Buka Panel Rigging & Animasi Karakter 3D"
        >
          <span class="btn-icon">🦴</span> Rigging Karakter
          <span v-if="showSkeletonRig" class="rig-badge-dot"></span>
        </button>
        <button
          class="action-btn ai-gen-btn"
          @click="emit('openAIGenerator')"
          title="Generate ruangan investigasi 3D otomatis dengan AI"
        >
          <span class="btn-icon">✨</span> AI Generate Room
        </button>
      </template>
    </div>

    <!-- Kontrol Pencahayaan & Grid Cepat -->
    <div class="header-right">
      <button
        v-if="currentRole === 'dosen'"
        :class="['light-btn', 'table-toggle-btn', { active: showMainTable }]"
        @click="emit('toggleMainTable')"
        title="Tampilkan / Sembunyikan meja investigasi laboratorium bawaan"
      >
        🪑 Meja Lab: {{ showMainTable ? 'ON' : 'OFF' }}
      </button>

      <button
        :class="['light-btn', 'grid-toggle-btn', { active: showGridHelper }]"
        @click="emit('toggleGridHelper')"
        title="Tampilkan / Sembunyikan garis panduan grid lantai"
      >
        📐 Grid Lantai: {{ showGridHelper ? 'ON' : 'OFF' }}
      </button>

      <div class="lighting-switch">
        <span class="lighting-label">💡 Cahaya:</span>
        <button
          :class="['light-btn', { active: lightingMode === 'bright' }]"
          @click="emit('setLightingPreset', 'bright')"
        >
          ☀️ Terang
        </button>
        <button
          :class="['light-btn', { active: lightingMode === 'studio' }]"
          @click="emit('setLightingPreset', 'studio')"
        >
          🏢 Studio
        </button>
        <button
          :class="['light-btn', { active: lightingMode === 'warm' }]"
          @click="emit('setLightingPreset', 'warm')"
        >
          🌆 Hangat
        </button>
        <button
          :class="['light-btn', { active: lightingMode === 'night' }]"
          @click="emit('setLightingPreset', 'night')"
          title="Pencahayaan malam hari / TKP dramatis"
        >
          🌙 Malam
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hud-header {
  position: absolute;
  top: 16px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  z-index: 20;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
}

/* ================= ROLE SELECTOR PILL ================= */
.role-selector-pill {
  display: flex;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(14px);
  padding: 4px;
  border-radius: 9999px;
  border: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.role-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 16px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-btn:hover {
  color: #f8fafc;
}

.role-btn.active {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.5);
}

/* Tombol Action Umum */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.upload-btn {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
}
.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
}

.primary-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}
.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
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

.rig-header-btn {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.3)) !important;
  border-color: rgba(168, 85, 247, 0.5) !important;
  color: #e2e8f0;
  position: relative;
}
.rig-header-btn.active {
  background: linear-gradient(135deg, #6366f1, #a855f7) !important;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
  border-color: #c084fc !important;
  color: #ffffff;
}
.rig-badge-dot {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  display: inline-block;
  margin-left: 4px;
  box-shadow: 0 0 8px #22c55e;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.ai-gen-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%) !important;
  color: #ffffff !important;
  border: 1px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4), 0 0 20px rgba(99, 102, 241, 0.15) !important;
  animation: aiGlow 3s ease-in-out infinite alternate;
}
.ai-gen-btn:hover {
  box-shadow: 0 6px 25px rgba(124, 58, 237, 0.6), 0 0 30px rgba(99, 102, 241, 0.3) !important;
  transform: translateY(-1px);
}

@keyframes aiGlow {
  from {
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4), 0 0 20px rgba(99, 102, 241, 0.15);
  }
  to {
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.6), 0 0 35px rgba(99, 102, 241, 0.25);
  }
}

/* Pengatur Cahaya Ruangan */
.lighting-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(14px);
  padding: 5px 8px 5px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.lighting-label {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  margin-right: 4px;
}

.light-btn {
  background: transparent;
  border: none;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.light-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
}

.light-btn.active {
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(56, 189, 248, 0.4);
}

.table-toggle-btn {
  background: rgba(245, 158, 11, 0.15) !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
  color: #fde68a !important;
}

.table-toggle-btn.active {
  background: rgba(245, 158, 11, 0.3) !important;
  border-color: #f59e0b !important;
  color: #ffffff !important;
}

.grid-toggle-btn {
  font-weight: 600;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #94a3b8;
}

.grid-toggle-btn.active {
  background: rgba(99, 102, 241, 0.25) !important;
  border-color: #818cf8 !important;
  color: #a5b4fc !important;
}

@media (max-width: 768px) {
  .hud-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
