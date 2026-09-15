<script setup lang="ts">
import type { useAIRoomGenerator } from '../../composables/useAIRoomGenerator'

const props = defineProps<{
  ai: ReturnType<typeof useAIRoomGenerator>
  currentRole: 'dosen' | 'mahasiswa'
}>()

const {
  showAIGeneratorModal,
  aiGeneratorStep,
  aiBrief,
  aiOptions,
  aiGenerationProgress,
  aiGenerationStatusText,
  aiGenerationLog,
  filteredAiGeneratedPreview,
  aiPreviewFilter,
  aiPreviewStats,
  geminiApiKey,
  inputApiKey,
  showApiKeyConfig,
  showApiKeyText,
  apiKeyFeedback,
  aiCaseTitle,
  aiRoomSummary,
  aiGenerationError,
  aiGenerationErrorMessage,
  saveApiKey,
  clearApiKey,
  closeAIGenerator,
  goToAIStep,
  goToOptionsFromBrief,
  startAIGeneration,
  applyGeneratedRoom,
  getCategoryLabel,
  getCategoryColor,
} = props.ai
</script>

<template>
  <!-- ================= MODAL AI ROOM GENERATOR ================= -->
  <div
    v-if="showAIGeneratorModal && currentRole === 'dosen'"
    class="modal-backdrop ai-backdrop"
    @click.self="closeAIGenerator"
  >
    <div class="ai-generator-modal">
      <!-- Header -->
      <div class="ai-modal-header">
        <div class="ai-header-left">
          <span class="ai-header-icon">✨</span>
          <div>
            <div class="ai-title-row">
              <h2>AI Room Generator</h2>
              <span v-if="geminiApiKey.trim()" class="ai-badge-live">🟢 Gemini Live AI</span>
              <span v-else class="ai-badge-mock">⚠️ Butuh API Key</span>
            </div>
            <p>Deskripsikan brief kasus investigasi, Gemini AI akan mendeduksi skenario & merancang TKP 3D utuh</p>
          </div>
        </div>
        <button class="close-btn" @click="closeAIGenerator">✕</button>
      </div>

      <!-- Step Indicator -->
      <div class="ai-step-indicator">
        <div
          :class="[
            'ai-step-dot',
            {
              active: aiGeneratorStep === 'brief',
              done: ['options', 'generating', 'preview', 'done'].includes(aiGeneratorStep),
            },
          ]"
        >
          <span>1</span>
          <small>Brief</small>
        </div>
        <div
          class="ai-step-line"
          :class="{ filled: ['options', 'generating', 'preview', 'done'].includes(aiGeneratorStep) }"
        ></div>
        <div
          :class="[
            'ai-step-dot',
            {
              active: aiGeneratorStep === 'options',
              done: ['generating', 'preview', 'done'].includes(aiGeneratorStep),
            },
          ]"
        >
          <span>2</span>
          <small>Opsi</small>
        </div>
        <div
          class="ai-step-line"
          :class="{ filled: ['generating', 'preview', 'done'].includes(aiGeneratorStep) }"
        ></div>
        <div
          :class="[
            'ai-step-dot',
            {
              active: aiGeneratorStep === 'generating',
              done: ['preview', 'done'].includes(aiGeneratorStep),
            },
          ]"
        >
          <span>3</span>
          <small>Generate</small>
        </div>
        <div
          class="ai-step-line"
          :class="{ filled: ['preview', 'done'].includes(aiGeneratorStep) }"
        ></div>
        <div
          :class="[
            'ai-step-dot',
            {
              active: aiGeneratorStep === 'preview' || aiGeneratorStep === 'done',
              done: aiGeneratorStep === 'done',
            },
          ]"
        >
          <span>4</span>
          <small>Preview</small>
        </div>
      </div>

      <!-- STEP 1: Brief -->
      <div v-if="aiGeneratorStep === 'brief'" class="ai-step-content">
        <!-- API Key Configuration Card -->
        <div class="ai-api-key-card">
          <div class="api-key-header" @click="showApiKeyConfig = !showApiKeyConfig">
            <div class="api-key-title">
              <span class="api-key-icon">🔑</span>
              <strong>Google Gemini API Key</strong>
              <span v-if="geminiApiKey.trim()" class="api-key-tag active">🟢 Key Terpasang</span>
              <span v-else class="api-key-tag mock">⚠️ Wajib Diisi</span>
            </div>
            <button class="api-key-toggle-btn" type="button" @click.stop="showApiKeyConfig = !showApiKeyConfig">
              {{ showApiKeyConfig ? 'Tutup ▲' : 'Atur / Tempel Key ▼' }}
            </button>
          </div>

          <div v-show="showApiKeyConfig || !geminiApiKey.trim()" class="api-key-body">
            <p class="api-key-desc">
              Tempelkan API Key Google Gemini Anda di bawah untuk mengaktifkan AI generatif forensik langsung (Live AI):
            </p>
            <div class="api-key-input-row">
              <div class="api-key-input-wrapper">
                <input
                  :type="showApiKeyText ? 'text' : 'password'"
                  v-model="inputApiKey"
                  placeholder="Tempelkan API Key di sini (AIzaSy...)"
                  class="api-key-input"
                  autocomplete="off"
                  spellcheck="false"
                  @keyup.enter="saveApiKey"
                />
                <button
                  type="button"
                  class="api-key-eye-btn"
                  @click="showApiKeyText = !showApiKeyText"
                  :title="showApiKeyText ? 'Sembunyikan Key' : 'Tampilkan Key'"
                >
                  {{ showApiKeyText ? '🙈' : '👁️' }}
                </button>
              </div>
              <button class="api-key-save-btn" type="button" @click="saveApiKey">
                💾 Simpan Key
              </button>
              <button
                v-if="geminiApiKey.trim()"
                class="api-key-clear-btn"
                type="button"
                @click="clearApiKey"
                title="Hapus Key"
              >
                ✕
              </button>
            </div>
            <div v-if="apiKeyFeedback" class="api-key-feedback">
              {{ apiKeyFeedback }}
            </div>
            <div class="api-key-footer">
              <span
                >💡 Tersimpan aman di browser (<code>localStorage</code>) atau via file <code>.env.local</code>. Gemini AI langsung mendeduksi TKP secara real-time.</span
              >
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                class="api-key-link"
              >
                Dapatkan Key Gratis di Google AI Studio ↗
              </a>
            </div>
          </div>
        </div>

        <div class="ai-section-title">
          <span class="section-icon">📝</span>
          <h3>Deskripsikan Brief Kasus Investigasi</h3>
        </div>

        <!-- Quick Scenario Presets -->
        <div class="ai-quick-presets">
          <span class="quick-preset-lbl">⚡ Contoh Kasus:</span>
          <button
            class="quick-preset-btn"
            @click="
              aiBrief =
                'Buat TKP pembunuhan di ruang kerja seorang pengusaha. Kejadian terjadi pada malam hari. Korban ditemukan di dekat meja kerja. Ruangan memiliki meja, kursi eksekutif terjatuh, rak buku, laptop menyala, lemari arsip terbuka. Sebar barang bukti seperti pecahan gelas whisky, noda darah di karpet, surat ancaman. Tambahkan petunjuk kode brankas dan red herring.'
            "
          >
            🏢 Kantor Pengusaha (Malam)
          </button>
          <button
            class="quick-preset-btn"
            @click="
              aiBrief =
                'Kasus sabotase di laboratorium kimia toksikologi. Ditemukan botol racun arsenik, tabung reaksi pecah, dan tumpahan zat kimia berpendar di lantai. Lemari pendingin reagen dibobol dan buku catatan riset dirobek.'
            "
          >
            🔬 Lab Toksikologi
          </button>
          <button
            class="quick-preset-btn"
            @click="
              aiBrief =
                'Kematian mencurigakan di kamar penthouse apartemen mewah. Korban ditemukan di ranjang dengan botol obat penenang tumpah di karpet. Brankas dinding terbobol dan pecahan piala anggur merah berserakan.'
            "
          >
            🏠 Penthouse Mewah
          </button>
          <button
            class="quick-preset-btn"
            @click="
              aiBrief =
                'TKP penyelundupan senjata di gudang pelabuhan. Terdapat peti kargo bertumpuk yang dibongkar paksa, drum minyak industri, linggis bernoda darah, dan selongsong peluru kaliber 9mm.'
            "
          >
            🏭 Gudang Pelabuhan
          </button>
        </div>

        <textarea
          v-model="aiBrief"
          class="ai-brief-textarea"
          rows="6"
          placeholder="Contoh: Buat TKP pembunuhan di ruang kerja seorang pengusaha. Kejadian terjadi pada malam hari. Korban ditemukan di dekat meja kerja. Ruangan memiliki meja, kursi, rak buku, laptop, lemari arsip. Sebar barang bukti seperti pecahan gelas, noda darah, surat ancaman. Tambahkan petunjuk tersembunyi dan beberapa red herring..."
        ></textarea>
        <p class="ai-hint-text">
          💡 <strong>AI Smart Deduction:</strong> Walaupun brief Anda singkat (misal: <em>&quot;pembunuhan di kantor&quot;</em> atau <em>&quot;racun di lab&quot;</em>), Gemini AI akan secara cerdas mendeduksi alur kriminalitas, profil korban, motif kejahatan, penataan perabotan 3D realistis, marker forensik kuning #1-#5, hingga catatan ilmiah rahasia untuk tiap objek.
        </p>
        <div class="ai-step-actions">
          <button class="action-btn secondary-btn" @click="closeAIGenerator">Batal</button>
          <button class="action-btn ai-next-btn" @click="goToOptionsFromBrief">
            Lanjut ke Opsi →
          </button>
        </div>
      </div>

      <!-- STEP 2: Options -->
      <div v-if="aiGeneratorStep === 'options'" class="ai-step-content">
        <div class="ai-section-title">
          <span class="section-icon">⚙️</span>
          <h3>Konfigurasi Parameter Generasi</h3>
        </div>

        <!-- Mode Penerapan Objek -->
        <div class="ai-mode-selector-box">
          <label class="ai-option-label">🛠️ Mode Penerapan ke Ruangan</label>
          <div class="ai-mode-options">
            <label :class="['ai-mode-card', { active: aiOptions.applyMode === 'replace' }]">
              <input
                type="radio"
                name="applyMode"
                value="replace"
                v-model="aiOptions.applyMode"
                class="hidden-radio"
              />
              <div class="mode-card-header">
                <span class="mode-card-icon">🧹</span>
                <strong>Ganti Ruangan Penuh (Rekomendasi)</strong>
              </div>
              <p>
                Bersihkan objek laboratorium lama dan sembunyikan meja bawaan. Ruangan 100% didedikasikan untuk TKP baru tanpa tumpang tindih.
              </p>
            </label>
            <label :class="['ai-mode-card', { active: aiOptions.applyMode === 'append' }]">
              <input
                type="radio"
                name="applyMode"
                value="append"
                v-model="aiOptions.applyMode"
                class="hidden-radio"
              />
              <div class="mode-card-header">
                <span class="mode-card-icon">➕</span>
                <strong>Gabungkan ke Ruangan</strong>
              </div>
              <p>
                Pertahankan objek yang sudah ada dan meja lab, lalu tambahkan objek hasil generate ke dalam scene.
              </p>
            </label>
          </div>
        </div>

        <div class="ai-options-grid">
          <div class="ai-option-group">
            <label class="ai-option-label">🏢 Tema Ruangan</label>
            <div class="ai-option-pills">
              <button
                v-for="t in [
                  { v: 'office', l: '🏢 Kantor' },
                  { v: 'lab', l: '🔬 Lab' },
                  { v: 'house', l: '🏠 Penthouse' },
                  { v: 'warehouse', l: '🏭 Gudang' },
                ]"
                :key="t.v"
                :class="['ai-pill', { active: aiOptions.theme === t.v }]"
                @click="aiOptions.theme = t.v"
              >
                {{ t.l }}
              </button>
            </div>
          </div>

          <div class="ai-option-group">
            <label class="ai-option-label">🌙 Suasana</label>
            <div class="ai-option-pills">
              <button
                v-for="a in [
                  { v: 'dark', l: '🌑 Gelap' },
                  { v: 'bright', l: '☀️ Terang' },
                  { v: 'gloomy', l: '🌫️ Suram' },
                ]"
                :key="a.v"
                :class="['ai-pill', { active: aiOptions.atmosphere === a.v }]"
                @click="aiOptions.atmosphere = a.v"
              >
                {{ a.l }}
              </button>
            </div>
          </div>

          <div class="ai-option-group">
            <label class="ai-option-label">🕐 Waktu Kejadian</label>
            <div class="ai-option-pills">
              <button
                v-for="t in [
                  { v: 'night', l: '🌙 Malam' },
                  { v: 'day', l: '🌅 Siang' },
                  { v: 'dawn', l: '🌄 Subuh' },
                ]"
                :key="t.v"
                :class="['ai-pill', { active: aiOptions.timeOfDay === t.v }]"
                @click="aiOptions.timeOfDay = t.v"
              >
                {{ t.l }}
              </button>
            </div>
          </div>
        </div>

        <!-- Pengaturan Forensik Lanjutan -->
        <div class="ai-checkboxes">
          <label class="ai-checkbox-item">
            <input type="checkbox" v-model="aiOptions.applyLighting" />
            <span class="checkbox-label">💡 Otomatis Atur Pencahayaan Malam / Dramatis</span>
          </label>
          <label class="ai-checkbox-item">
            <input type="checkbox" v-model="aiOptions.includeMarkers" />
            <span class="checkbox-label">🏷️ Sertakan Marker Bukti Kuning (#1 - #5)</span>
          </label>
          <label class="ai-checkbox-item">
            <input type="checkbox" v-model="aiOptions.includeVictimChalk" />
            <span class="checkbox-label">🚶 Siluet Kapur Posisi Korban di Lantai</span>
          </label>
          <label class="ai-checkbox-item">
            <input type="checkbox" v-model="aiOptions.includeFurniture" />
            <span class="checkbox-label">🪑 Sertakan Furniture Presisi</span>
          </label>
          <label class="ai-checkbox-item">
            <input type="checkbox" v-model="aiOptions.includeEvidence" />
            <span class="checkbox-label">🔬 Sertakan Barang Bukti Kunci</span>
          </label>
          <label class="ai-checkbox-item">
            <input type="checkbox" v-model="aiOptions.includeClues" />
            <span class="checkbox-label">🧩 Sertakan Petunjuk Tersembunyi</span>
          </label>
          <label class="ai-checkbox-item">
            <input type="checkbox" v-model="aiOptions.includeRedHerrings" />
            <span class="checkbox-label">🎭 Sertakan Red Herring (Pengecoh)</span>
          </label>
        </div>

        <div class="ai-step-actions">
          <button class="action-btn secondary-btn" @click="goToAIStep('brief')">← Kembali</button>
          <button class="action-btn ai-next-btn ai-generate-start-btn" @click="startAIGeneration">
            🚀 Mulai Generate Ruangan
          </button>
        </div>
      </div>

      <!-- STEP 3: Generating -->
      <div v-if="aiGeneratorStep === 'generating'" class="ai-step-content ai-generating-step">
        <div class="ai-generating-visual">
          <div class="ai-brain-anim">{{ aiGenerationError ? '⚠️' : '✨' }}</div>
          <div class="ai-engine-active-pill">
            <span class="ai-source-badge live">🤖 Google Gemini Generative AI</span>
          </div>
          <h3>{{ aiGenerationStatusText }}</h3>
          <div v-if="!aiGenerationError" class="ai-progress-container">
            <div class="ai-progress-bar" :style="{ width: aiGenerationProgress + '%' }"></div>
          </div>
          <span v-if="!aiGenerationError" class="ai-progress-pct">{{ aiGenerationProgress }}%</span>
        </div>

        <!-- Error Alert Card jika ada kegagalan -->
        <div v-if="aiGenerationError" class="ai-error-box">
          <div class="ai-error-header">
            <span class="ai-error-icon">⚠️</span>
            <strong>Generasi TKP Terhenti</strong>
          </div>
          <p class="ai-error-msg">{{ aiGenerationErrorMessage }}</p>
          <div class="ai-error-actions">
            <button class="action-btn secondary-btn" type="button" @click="goToAIStep('brief')">
              ← Kembali ke Pengaturan Key / Brief
            </button>
            <button class="action-btn ai-next-btn" type="button" @click="startAIGeneration">
              🔄 Coba Lagi
            </button>
          </div>
        </div>

        <div class="ai-log-container">
          <div class="ai-log-title">📋 Log Proses Forensik Gemini:</div>
          <div class="ai-log-entries">
            <div
              v-for="(log, idx) in aiGenerationLog"
              :key="idx"
              class="ai-log-entry"
              :class="{
                'log-err': log.includes('❌'),
                'log-success': log.includes('✨') || log.includes('✅'),
              }"
            >
              <span class="log-time">{{ String(idx + 1).padStart(2, '0') }}</span>
              <span class="log-text">{{ log }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: Preview -->
      <div v-if="aiGeneratorStep === 'preview'" class="ai-step-content">
        <div class="ai-section-title ai-preview-title-bar">
          <div class="ai-preview-title-left">
            <span class="section-icon">👁️</span>
            <div>
              <h3 class="ai-case-title-heading">{{ aiCaseTitle || 'Preview Rancangan TKP Forensik' }}</h3>
              <span class="ai-preview-subtitle">Dideduksi & dirancang otomatis oleh Google Gemini</span>
            </div>
          </div>
          <span class="ai-source-badge live">🤖 Google Gemini Generative AI</span>
        </div>

        <!-- Ringkasan AI jika ada -->
        <div v-if="aiRoomSummary" class="ai-room-summary-box">
          <span class="summary-icon">📜</span>
          <div class="summary-content">
            <strong>Rekonstruksi Kasus & Narasi Forensik:</strong>
            <p>{{ aiRoomSummary }}</p>
          </div>
        </div>

        <!-- Statistik Objek -->
        <div class="ai-stats-row">
          <div class="ai-stat-card">
            <span class="stat-num">{{ aiPreviewStats.total }}</span>
            <span class="stat-lbl">Total Objek</span>
          </div>
          <div class="ai-stat-card" style="border-color: #64748b">
            <span class="stat-num">{{ aiPreviewStats.furniture }}</span>
            <span class="stat-lbl">🪑 Furniture</span>
          </div>
          <div class="ai-stat-card" style="border-color: #ef4444">
            <span class="stat-num">{{ aiPreviewStats.evidence }}</span>
            <span class="stat-lbl">🔬 Bukti</span>
          </div>
          <div class="ai-stat-card" style="border-color: #f59e0b">
            <span class="stat-num">{{ aiPreviewStats.clue }}</span>
            <span class="stat-lbl">🧩 Petunjuk</span>
          </div>
          <div class="ai-stat-card" style="border-color: #8b5cf6">
            <span class="stat-num">{{ aiPreviewStats.redHerring }}</span>
            <span class="stat-lbl">🎭 Pengecoh</span>
          </div>
        </div>

        <!-- Filter Kategori Preview Tabs -->
        <div class="ai-preview-tabs">
          <button
            :class="['ai-tab-btn', { active: aiPreviewFilter === 'all' }]"
            @click="aiPreviewFilter = 'all'"
          >
            Semua ({{ aiPreviewStats.total }})
          </button>
          <button
            :class="['ai-tab-btn', { active: aiPreviewFilter === 'furniture' }]"
            @click="aiPreviewFilter = 'furniture'"
          >
            🪑 Furniture ({{ aiPreviewStats.furniture }})
          </button>
          <button
            :class="['ai-tab-btn', { active: aiPreviewFilter === 'evidence' }]"
            @click="aiPreviewFilter = 'evidence'"
          >
            🔬 Barang Bukti ({{ aiPreviewStats.evidence }})
          </button>
          <button
            :class="['ai-tab-btn', { active: aiPreviewFilter === 'clue' }]"
            @click="aiPreviewFilter = 'clue'"
          >
            🧩 Petunjuk ({{ aiPreviewStats.clue }})
          </button>
          <button
            :class="['ai-tab-btn', { active: aiPreviewFilter === 'red_herring' }]"
            @click="aiPreviewFilter = 'red_herring'"
          >
            🎭 Pengecoh ({{ aiPreviewStats.redHerring }})
          </button>
        </div>

        <!-- Daftar Objek Preview -->
        <div class="ai-preview-list">
          <div v-for="(item, idx) in filteredAiGeneratedPreview" :key="idx" class="ai-preview-item">
            <div class="ai-preview-color" :style="{ backgroundColor: item.color }"></div>
            <div class="ai-preview-info">
              <div class="ai-preview-name">
                {{ item.name }}
                <span v-if="item.isKey" class="ai-key-badge">🔑 BUKTI KUNCI</span>
                <span v-if="item.locationBadge" class="ai-loc-badge">📍 {{ item.locationBadge }}</span>
              </div>
              <div class="ai-preview-desc">{{ item.desc }}</div>
            </div>
            <span
              class="ai-category-badge"
              :style="{ backgroundColor: getCategoryColor(item.category) }"
            >
              {{ getCategoryLabel(item.category) }}
            </span>
          </div>
        </div>

        <div class="ai-step-actions">
          <button class="action-btn secondary-btn" @click="goToAIStep('options')">← Ubah Opsi</button>
          <button class="action-btn ai-next-btn ai-apply-btn" @click="applyGeneratedRoom">
            ✅ Terapkan ke Ruangan 3D
          </button>
        </div>
      </div>

      <!-- STEP 5: Done -->
      <div v-if="aiGeneratorStep === 'done'" class="ai-step-content ai-done-step">
        <div class="ai-done-visual">
          <span class="ai-done-icon">🎉</span>
          <h3>Ruangan Berhasil Digenerate!</h3>
          <p>{{ aiPreviewStats.total }} objek telah ditambahkan ke ruangan investigasi 3D Anda.</p>
          <p class="ai-done-hint">
            Anda dapat mengatur ulang posisi dan catatan setiap objek menggunakan inspector panel.
          </p>
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn {
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.secondary-btn {
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 10px 18px;
  border-radius: 12px;
}

.secondary-btn:hover {
  background: rgba(71, 85, 105, 0.9);
  color: #ffffff;
}

/* ================= AI ROOM GENERATOR STYLES ================= */
.ai-backdrop {
  z-index: 200;
}

.ai-generator-modal {
  background: rgba(15, 23, 42, 0.97);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 24px;
  width: min(720px, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(99, 102, 241, 0.15);
  animation: aiModalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes aiModalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ai-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%);
  border-radius: 24px 24px 0 0;
}

.ai-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ai-header-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
}

.ai-modal-header h2 {
  font-size: 18px;
  color: #f8fafc;
  font-weight: 800;
  margin: 0;
}

.ai-modal-header p {
  font-size: 12px;
  color: #94a3b8;
  margin: 2px 0 0;
}

/* Step Indicator */
.ai-step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.ai-step-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ai-step-dot span {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  background: rgba(51, 65, 85, 0.8);
  color: #64748b;
  border: 2px solid #334155;
  transition: all 0.35s ease;
}

.ai-step-dot.active span {
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

.ai-step-dot.done span {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

.ai-step-dot small {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}

.ai-step-dot.active small,
.ai-step-dot.done small {
  color: #cbd5e1;
}

.ai-step-line {
  width: 40px;
  height: 2px;
  background: #334155;
  margin: 0 8px;
  margin-bottom: 16px;
  border-radius: 2px;
  transition: background 0.35s ease;
}

.ai-step-line.filled {
  background: linear-gradient(90deg, #10b981, #6366f1);
}

/* Step Content */
.ai-step-content {
  padding: 24px;
}

.ai-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.ai-section-title .section-icon {
  font-size: 22px;
}

.ai-section-title h3 {
  font-size: 16px;
  color: #f8fafc;
  font-weight: 700;
  margin: 0;
}

/* Brief Textarea */
.ai-brief-textarea {
  width: 100%;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 14px;
  padding: 14px 16px;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-brief-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.ai-brief-textarea::placeholder {
  color: #475569;
}

.ai-hint-text {
  font-size: 11px;
  color: #64748b;
  margin-top: 10px;
}

/* Options Grid */
.ai-options-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 18px;
}

.ai-option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-option-label {
  font-size: 12px;
  font-weight: 700;
  color: #cbd5e1;
}

.ai-option-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-pill {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-pill:hover {
  border-color: #6366f1;
  color: #e2e8f0;
}

.ai-pill.active {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  border-color: #6366f1;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);
}

/* Checkboxes */
.ai-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 14px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.ai-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.ai-checkbox-item input[type='checkbox'] {
  accent-color: #6366f1;
  width: 16px;
  height: 16px;
}

.checkbox-label {
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 600;
}

/* Step Actions */
.ai-step-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.ai-next-btn {
  background: linear-gradient(135deg, #6366f1, #7c3aed) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  padding: 10px 22px !important;
  border-radius: 12px !important;
}

.ai-next-btn:hover {
  box-shadow: 0 4px 18px rgba(99, 102, 241, 0.4) !important;
}

.ai-generate-start-btn {
  background: linear-gradient(135deg, #059669, #10b981) !important;
}

.ai-generate-start-btn:hover {
  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.4) !important;
}

.ai-apply-btn {
  background: linear-gradient(135deg, #059669, #10b981) !important;
}

/* Generating Step */
.ai-generating-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.ai-generating-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.ai-brain-anim {
  font-size: 56px;
  animation: aiBrainPulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.6));
}

@keyframes aiBrainPulse {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  50% {
    transform: scale(1.15) rotate(5deg);
  }
  75% {
    transform: scale(1.08) rotate(-3deg);
  }
}

.ai-generating-visual h3 {
  font-size: 15px;
  color: #e2e8f0;
  font-weight: 700;
  text-align: center;
  margin: 0;
}

.ai-progress-container {
  width: 100%;
  max-width: 480px;
  height: 10px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.ai-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #7c3aed, #a855f7);
  border-radius: 9999px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.ai-progress-pct {
  font-size: 22px;
  font-weight: 800;
  color: #a5b4fc;
}

.ai-log-container {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px;
}

.ai-log-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.ai-log-entries {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 160px;
  overflow-y: auto;
}

.ai-log-entry {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  animation: logFadeIn 0.4s ease;
}

@keyframes logFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.log-time {
  font-size: 10px;
  font-weight: 800;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 22px;
  text-align: center;
}

.log-text {
  color: #cbd5e1;
  line-height: 1.4;
}

/* Preview Stats */
.ai-stats-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.ai-stat-card {
  flex: 1;
  min-width: 80px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-stat-card .stat-num {
  font-size: 24px;
  font-weight: 800;
  color: #f8fafc;
}

.ai-stat-card .stat-lbl {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
}

/* Preview List */
.ai-preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 4px;
}

.ai-preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 10px 14px;
  transition: background 0.2s ease;
}

.ai-preview-item:hover {
  background: rgba(30, 41, 59, 0.8);
}

.ai-preview-color {
  width: 10px;
  height: 38px;
  border-radius: 5px;
  flex-shrink: 0;
}

.ai-preview-info {
  flex: 1;
  min-width: 0;
}

.ai-preview-name {
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-key-badge {
  font-size: 9px;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}

.ai-preview-desc {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-category-badge {
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Done Step */
.ai-done-step {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
}

.ai-done-visual {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ai-done-icon {
  font-size: 64px;
  animation: donePopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes donePopIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-done-visual h3 {
  font-size: 20px;
  color: #10b981;
  font-weight: 800;
  margin: 0;
}

.ai-done-visual p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.ai-done-hint {
  font-size: 11px !important;
  color: #64748b !important;
  margin-top: 8px !important;
}

/* Quick Scenario Presets */
.ai-quick-presets {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.quick-preset-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.quick-preset-btn {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #c7d2fe;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-preset-btn:hover {
  background: rgba(99, 102, 241, 0.25);
  border-color: #818cf8;
  color: #ffffff;
  transform: translateY(-1px);
}

/* Mode Selector Box (Replace vs Append) */
.ai-mode-selector-box {
  margin-bottom: 16px;
}

.ai-mode-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.ai-mode-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(30, 41, 59, 0.45);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-mode-card:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(99, 102, 241, 0.35);
}

.ai-mode-card.active {
  background: rgba(99, 102, 241, 0.12);
  border-color: #6366f1;
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
}

.hidden-radio {
  display: none;
}

.mode-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f8fafc;
  font-size: 12px;
}

.mode-card-icon {
  font-size: 16px;
}

.ai-mode-card p {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0;
}

/* Preview Filter Tabs */
.ai-preview-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.ai-tab-btn {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.ai-tab-btn:hover {
  background: rgba(30, 41, 59, 0.8);
  color: #f8fafc;
}

.ai-tab-btn.active {
  background: #6366f1;
  border-color: #818cf8;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
}

.ai-loc-badge {
  font-size: 10px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 1px 6px;
  border-radius: 4px;
}

/* ================= GEMINI API KEY & ENGINE STYLES ================= */
.ai-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-badge-live {
  font-size: 10.5px;
  font-weight: 700;
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.3px;
}

.ai-badge-mock {
  font-size: 10.5px;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.3px;
}

.ai-api-key-card {
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 14px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.ai-api-key-card:hover {
  border-color: rgba(99, 102, 241, 0.45);
}

.api-key-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.6);
  cursor: pointer;
  user-select: none;
}

.api-key-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #f8fafc;
}

.api-key-icon {
  font-size: 14px;
}

.api-key-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 9999px;
}

.api-key-tag.active {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.api-key-tag.mock {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.api-key-toggle-btn {
  background: none;
  border: none;
  color: #818cf8;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.api-key-toggle-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  color: #c7d2fe;
}

.api-key-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(15, 23, 42, 0.35);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.api-key-desc {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.api-key-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-input-wrapper {
  position: relative;
  flex: 1;
}

.api-key-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px 36px 8px 12px;
  color: #f8fafc;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  outline: none;
  transition: all 0.2s ease;
}

.api-key-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
}

.api-key-eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0.75;
  transition: opacity 0.2s;
}

.api-key-eye-btn:hover {
  opacity: 1;
}

.api-key-save-btn {
  background: #6366f1;
  border: 1px solid #818cf8;
  border-radius: 8px;
  color: #ffffff;
  padding: 8px 14px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.api-key-save-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.api-key-clear-btn {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.api-key-clear-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #ffffff;
}

.api-key-feedback {
  font-size: 11px;
  font-weight: 600;
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.api-key-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10.5px;
  color: #64748b;
  margin-top: 2px;
}

.api-key-footer code {
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.15);
  padding: 1px 4px;
  border-radius: 3px;
}

.api-key-link {
  color: #818cf8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.api-key-link:hover {
  color: #a5b4fc;
  text-decoration: underline;
}

.ai-engine-active-pill {
  margin-bottom: 8px;
}

.ai-source-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ai-source-badge.live {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.ai-source-badge.mock {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.ai-error-box {
  background: rgba(239, 68, 68, 0.12);
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 12px 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fadeIn 0.3s ease;
}

.ai-error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #fca5a5;
}

.ai-error-icon {
  font-size: 16px;
}

.ai-error-msg {
  font-size: 12px;
  color: #fecaca;
  margin: 0;
  line-height: 1.45;
}

.ai-error-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.ai-case-title-heading {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.2;
}

.ai-preview-subtitle {
  font-size: 11px;
  color: #94a3b8;
  display: block;
  margin-top: 2px;
}

.ai-log-entry.log-err {
  background: rgba(239, 68, 68, 0.15);
  border-left: 3px solid #ef4444;
}

.ai-log-entry.log-err .log-text {
  color: #fca5a5;
  font-weight: 600;
}

.ai-log-entry.log-success {
  background: rgba(16, 185, 129, 0.12);
  border-left: 3px solid #10b981;
}

.ai-log-entry.log-success .log-text {
  color: #6ee7b7;
}

.ai-preview-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-preview-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-room-summary-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 14px;
}

.summary-icon {
  font-size: 18px;
  margin-top: 1px;
}

.summary-content strong {
  font-size: 11px;
  color: #a5b4fc;
  display: block;
  margin-bottom: 2px;
}

.summary-content p {
  font-size: 11.5px;
  color: #e2e8f0;
  margin: 0;
  line-height: 1.4;
}
</style>
