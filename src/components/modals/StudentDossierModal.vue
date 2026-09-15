<script setup lang="ts">
import type { InvestigationObject } from '../../types/investigation'

defineProps<{
  inspectedObject: InvestigationObject | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggleInspected', obj: InvestigationObject): void
}>()
</script>

<template>
  <!-- ================= MODAL DOSSIER BUKTI MAHASISWA ================= -->
  <div v-if="inspectedObject" class="modal-backdrop" @click.self="emit('close')">
    <div class="dossier-card">
      <div class="dossier-header">
        <div class="dossier-badge-row">
          <span class="dossier-type-tag">{{ inspectedObject.type.toUpperCase() }}</span>
          <span
            :class="[
              'dossier-status-tag',
              inspectedObject.isInspected ? 'verified-tag' : 'pending-tag',
            ]"
          >
            {{ inspectedObject.isInspected ? '✓ TERVERIFIKASI' : '⏳ BELUM DIPERIKSA' }}
          </span>
        </div>
        <h2>{{ inspectedObject.name }}</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="dossier-content">
        <!-- Deskripsi Umum -->
        <div class="dossier-info-block">
          <h4>Keterangan Fisik Barang Bukti</h4>
          <p>{{ inspectedObject.desc }}</p>
        </div>

        <!-- Catatan / Arahan Khusus Dosen -->
        <div class="dossier-notes-block">
          <div class="notes-header">
            <span class="notes-icon">👨‍🏫</span>
            <h4>Catatan & Arahan Dosen Pembimbing:</h4>
          </div>
          <p class="notes-body">
            {{
              inspectedObject.notes ||
              'Tidak ada catatan khusus yang ditambahkan oleh dosen untuk barang bukti ini.'
            }}
          </p>
        </div>

        <!-- Posisi & Koordinat Bukti di TKP -->
        <div class="dossier-meta-row">
          <span>📍 Koordinat TKP:</span>
          <code>X: {{ inspectedObject.position[0] }} | Y: {{ inspectedObject.position[1] }} | Z: {{ inspectedObject.position[2] }}</code>
        </div>

        <!-- Tombol Tindakan Mahasiswa -->
        <div class="dossier-footer-actions">
          <button
            :class="[
              'action-btn',
              inspectedObject.isInspected ? 'verified-action-btn' : 'primary-btn',
            ]"
            @click="emit('toggleInspected', inspectedObject)"
          >
            <span v-if="inspectedObject.isInspected">✓ Sudah Terverifikasi (Klik untuk Batal)</span>
            <span v-else>🔍 Tandai Selesai Diperiksa</span>
          </button>
          <button class="action-btn secondary-btn" @click="emit('close')">
            Tutup Berkas (ESC)
          </button>
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

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.primary-btn {
  background: #38bdf8;
  color: #0f172a;
}

.primary-btn:hover {
  background: #7dd3fc;
}

.secondary-btn {
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid #475569;
  color: #cbd5e1;
}

.secondary-btn:hover {
  background: rgba(71, 85, 105, 0.9);
  color: #ffffff;
}

.dossier-card {
  width: 580px;
  max-width: 90vw;
  background: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
  animation: fadeIn 0.2s ease-out;
}

.dossier-header {
  position: relative;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dossier-badge-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.dossier-type-tag {
  font-size: 10px;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  padding: 3px 8px;
  border-radius: 6px;
}

.dossier-status-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.verified-tag {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.pending-tag {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.dossier-header h2 {
  font-size: 20px;
  color: #f8fafc;
  margin: 0;
}

.dossier-header .close-btn {
  position: absolute;
  top: 0;
  right: 0;
}

.dossier-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dossier-info-block h4,
.notes-header h4 {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dossier-info-block p {
  font-size: 14px;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.5;
}

/* Kotak Catatan Dosen */
.dossier-notes-block {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 12px;
  padding: 14px;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.notes-header h4 {
  color: #818cf8;
  margin: 0;
  font-size: 12px;
}

.notes-body {
  font-size: 13px;
  color: #f1f5f9;
  line-height: 1.5;
  margin: 0;
}

.dossier-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #94a3b8;
}

.dossier-meta-row code {
  background: rgba(15, 23, 42, 0.8);
  padding: 4px 8px;
  border-radius: 6px;
  color: #cbd5e1;
}

.dossier-footer-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.dossier-footer-actions button {
  flex: 1;
  justify-content: center;
}

.verified-action-btn {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid #10b981;
  color: #34d399;
}

.verified-action-btn:hover {
  background: #10b981;
  color: #ffffff;
}
</style>
