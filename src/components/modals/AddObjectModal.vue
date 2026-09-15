<script setup lang="ts">
import type { ObjectPreset } from '../../types/investigation'

defineProps<{
  show: boolean
  uploadError: string | null
  presets: ObjectPreset[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'triggerFileInput'): void
  (e: 'addPreset', preset: ObjectPreset): void
}>()
</script>

<template>
  <!-- ================= MODAL TAMBAH OBJEK (DOSEN) ================= -->
  <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2>Tambah Objek ke Ruangan</h2>
          <p>Upload model 3D buatan Anda sendiri atau pilih dari objek preset</p>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-upload-zone" @click="emit('triggerFileInput')">
        <span class="upload-zone-icon">☁️</span>
        <div class="upload-zone-text">
          <h4>Klik untuk Upload atau Drag & Drop Model 3D</h4>
          <p>Mendukung format <b>.glb</b>, <b>.gltf</b>, dan <b>.obj</b> (Otomatis ditaruh di meja)</p>
        </div>
        <button class="action-btn upload-btn mini-upload-btn" type="button">Pilih File</button>
      </div>

      <div v-if="uploadError" class="modal-error-alert">
        ⚠️ {{ uploadError }}
      </div>

      <div class="modal-divider">
        <span>ATAU PILIH PRESET BAWAAN</span>
      </div>

      <div class="preset-grid">
        <div
          v-for="(p, i) in presets"
          :key="i"
          class="preset-item"
          @click="emit('addPreset', p)"
        >
          <div class="preset-color-dot" :style="{ backgroundColor: p.color }"></div>
          <div class="preset-info">
            <h4>{{ p.name }}</h4>
            <p>{{ p.desc }}</p>
          </div>
          <span class="preset-add-tag">+ Tambah</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 70;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-card {
  width: 600px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 18px;
  color: #f8fafc;
  margin: 0 0 4px 0;
}

.modal-header p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

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

.modal-upload-zone {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(30, 41, 59, 0.7);
  border: 2px dashed rgba(99, 102, 241, 0.6);
  border-radius: 14px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.modal-upload-zone:hover {
  background: rgba(49, 46, 129, 0.3);
  border-color: #818cf8;
  transform: translateY(-2px);
}

.upload-zone-icon {
  font-size: 32px;
}

.upload-zone-text {
  flex: 1;
}

.upload-zone-text h4 {
  font-size: 14px;
  color: #f8fafc;
  margin: 0 0 2px 0;
}

.upload-zone-text p {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}

.action-btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.upload-btn {
  background: #6366f1;
  color: #ffffff;
}

.mini-upload-btn {
  padding: 6px 14px;
  font-size: 12px;
}

.modal-error-alert {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 14px;
}

.modal-divider {
  text-align: center;
  position: relative;
  margin: 20px 0 16px 0;
}

.modal-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.modal-divider span {
  position: relative;
  background: #0f172a;
  padding: 0 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #64748b;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 600px) {
  .preset-grid {
    grid-template-columns: 1fr;
  }
}

.preset-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-item:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

.preset-color-dot {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.preset-info {
  flex: 1;
}

.preset-info h4 {
  font-size: 13px;
  color: #f8fafc;
  margin: 0 0 2px 0;
}

.preset-info p {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.3;
}

.preset-add-tag {
  font-size: 11px;
  font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.15);
  padding: 4px 8px;
  border-radius: 6px;
}
</style>
