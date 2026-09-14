<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, TransformControls } from '@tresjs/cientos'
import { BasicShadowMap, SRGBColorSpace, type Object3D } from 'three'

// Tipe data objek investigasi
export interface InvestigationObject {
  id: string
  name: string
  desc: string
  type: 'box' | 'octahedron' | 'cylinder' | 'sphere' | 'capsule'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  roughness: number
  metalness: number
  args: number[]
}

// Opsi rendering canvas
const glOptions = {
  clearColor: '#202938', // Warna latar belakang cerah / tidak gelap
  shadows: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
}

// Kontrol pencahayaan ruangan agar terang dan jelas
const lightingMode = ref<'bright' | 'studio' | 'warm'>('bright')
const ambientIntensity = ref(1.6) // Ambient terang
const directionalIntensity = ref(2.2) // Lampu sorot utama terang
const hemisphereIntensity = ref(1.2) // Pengisi bayangan agar tidak hitam pekat

function setLightingPreset(mode: 'bright' | 'studio' | 'warm') {
  lightingMode.value = mode
  if (mode === 'bright') {
    ambientIntensity.value = 1.8
    directionalIntensity.value = 2.4
    hemisphereIntensity.value = 1.4
  } else if (mode === 'studio') {
    ambientIntensity.value = 1.4
    directionalIntensity.value = 2.0
    hemisphereIntensity.value = 1.0
  } else {
    ambientIntensity.value = 1.2
    directionalIntensity.value = 1.8
    hemisphereIntensity.value = 0.9
  }
}

// Daftar objek interaktif di dalam ruangan
const objects = reactive<InvestigationObject[]>([
  {
    id: 'obj-dossier',
    name: 'Dokumen Rahasia',
    desc: 'Berkas dossier investigasi kasus utama.',
    type: 'box',
    position: [-1.2, 1.3, 0.3],
    rotation: [0, 0.25, 0],
    scale: [1, 1, 1],
    color: '#f59e0b',
    roughness: 0.5,
    metalness: 0.1,
    args: [0.75, 0.08, 0.95],
  },
  {
    id: 'obj-crystal',
    name: 'Artefak Kristal TKP',
    desc: 'Sampel kristal mineral nomor bukti #09.',
    type: 'octahedron',
    position: [0, 1.45, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: '#38bdf8',
    roughness: 0.1,
    metalness: 0.8,
    args: [0.28],
  },
  {
    id: 'obj-safe',
    name: 'Brankas Mini Digital',
    desc: 'Penyimpanan bukti dengan kunci biometrik.',
    type: 'box',
    position: [1.2, 1.45, -0.3],
    rotation: [0, -0.35, 0],
    scale: [1, 1, 1],
    color: '#3b82f6',
    roughness: 0.2,
    metalness: 0.85,
    args: [0.65, 0.45, 0.55],
  },
])

// Preset untuk menambah objek baru
const objectPresets = [
  {
    type: 'box' as const,
    name: 'Koper Bukti Forensik',
    desc: 'Koper alumunium berisi alat forensik.',
    color: '#64748b',
    args: [0.8, 0.25, 0.6],
    roughness: 0.3,
    metalness: 0.7,
  },
  {
    type: 'cylinder' as const,
    name: 'Tabung Sampel Kimia',
    desc: 'Tabung silinder cairan bukti kimiawi.',
    color: '#10b981',
    args: [0.12, 0.12, 0.45, 32],
    roughness: 0.1,
    metalness: 0.5,
  },
  {
    type: 'sphere' as const,
    name: 'Sensor Digital TKP',
    desc: 'Orbe sensor pemindai 3D portabel.',
    color: '#a855f7',
    args: [0.22, 32, 32],
    roughness: 0.1,
    metalness: 0.9,
  },
  {
    type: 'capsule' as const,
    name: 'Kapsul Bukti Nanotech',
    desc: 'Kapsul penyimpan microchip bukti.',
    color: '#ec4899',
    args: [0.12, 0.3, 16, 32],
    roughness: 0.2,
    metalness: 0.6,
  },
  {
    type: 'box' as const,
    name: 'Kotak Arsip Dokumen',
    desc: 'Kardus penyimpanan berkas perkara.',
    color: '#d97706',
    args: [0.6, 0.4, 0.5],
    roughness: 0.8,
    metalness: 0.05,
  },
  {
    type: 'octahedron' as const,
    name: 'Permata Bukti Sitaan',
    desc: 'Batu permata bernilai tinggi dari brankas.',
    color: '#ef4444',
    args: [0.25],
    roughness: 0.1,
    metalness: 0.95,
  },
]

// State seleksi & gizmo transform
const selectedId = ref<string | null>('obj-crystal')
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate')
const isTransformDragging = ref(false)
const showAddModal = ref(false)
const showObjectList = ref(false)

// Peta referensi Three.js Mesh
const meshInstances = new Map<string, Object3D>()

function setMeshRef(id: string, el: any) {
  if (el) {
    meshInstances.set(id, el.instance || el)
  } else {
    meshInstances.delete(id)
  }
}

const selectedObject = computed(() => {
  return objects.find((o) => o.id === selectedId.value) || null
})

const selectedMeshInstance = computed(() => {
  if (!selectedId.value) return null
  return meshInstances.get(selectedId.value) || null
})

function selectObject(id: string) {
  selectedId.value = id
}

// Tambah objek baru di atas meja
function addNewObject(preset: (typeof objectPresets)[number]) {
  const newId = `obj-${Date.now()}`
  // Posisi acak di atas meja (area meja: X: -1.6 s/d 1.6, Z: -0.7 s/d 0.7, Y: 1.35)
  const randX = Number(((Math.random() - 0.5) * 2.6).toFixed(2))
  const randZ = Number(((Math.random() - 0.5) * 1.4).toFixed(2))

  const newObj: InvestigationObject = {
    id: newId,
    name: `${preset.name} #${objects.length + 1}`,
    desc: preset.desc,
    type: preset.type,
    position: [randX, 1.35, randZ],
    rotation: [0, Number((Math.random() * Math.PI).toFixed(2)), 0],
    scale: [1, 1, 1],
    color: preset.color,
    roughness: preset.roughness,
    metalness: preset.metalness,
    args: [...preset.args],
  }

  objects.push(newObj)
  selectedId.value = newId
  showAddModal.value = false
}

// Duplikasi objek terpilih
function duplicateSelectedObject() {
  if (!selectedObject.value) return
  const orig = selectedObject.value
  const newId = `obj-${Date.now()}`
  const newObj: InvestigationObject = {
    ...orig,
    id: newId,
    name: `${orig.name} (Salinan)`,
    position: [
      Number((orig.position[0] + 0.3).toFixed(2)),
      orig.position[1],
      Number((orig.position[2] + 0.2).toFixed(2)),
    ],
    rotation: [...orig.rotation],
    scale: [...orig.scale],
    args: [...orig.args],
  }
  objects.push(newObj)
  selectedId.value = newId
}

// Hapus objek terpilih
function deleteSelectedObject() {
  if (!selectedId.value) return
  const idx = objects.findIndex((o) => o.id === selectedId.value)
  if (idx !== -1) {
    meshInstances.delete(selectedId.value)
    objects.splice(idx, 1)
    selectedId.value = objects.length > 0 ? objects[0].id : null
  }
}

// Sinkronisasi saat objek digeser lewat Gizmo 3D (TransformControls)
function syncTransformFromGizmo() {
  if (!selectedObject.value || !selectedMeshInstance.value) return
  const mesh = selectedMeshInstance.value
  selectedObject.value.position = [
    Number(mesh.position.x.toFixed(2)),
    Number(mesh.position.y.toFixed(2)),
    Number(mesh.position.z.toFixed(2)),
  ]
  selectedObject.value.rotation = [
    Number(mesh.rotation.x.toFixed(2)),
    Number(mesh.rotation.y.toFixed(2)),
    Number(mesh.rotation.z.toFixed(2)),
  ]
  selectedObject.value.scale = [
    Number(mesh.scale.x.toFixed(2)),
    Number(mesh.scale.y.toFixed(2)),
    Number(mesh.scale.z.toFixed(2)),
  ]
}

// Update posisi langsung dari slider / input panel UI
function updatePosition(axis: 0 | 1 | 2, val: number) {
  if (!selectedObject.value) return
  selectedObject.value.position[axis] = Number(val)
  if (selectedMeshInstance.value) {
    if (axis === 0) selectedMeshInstance.value.position.x = Number(val)
    if (axis === 1) selectedMeshInstance.value.position.y = Number(val)
    if (axis === 2) selectedMeshInstance.value.position.z = Number(val)
  }
}

// Update rotasi Y dari panel
function updateRotationY(degrees: number) {
  if (!selectedObject.value) return
  const rad = (degrees * Math.PI) / 180
  selectedObject.value.rotation[1] = Number(rad.toFixed(2))
  if (selectedMeshInstance.value) {
    selectedMeshInstance.value.rotation.y = rad
  }
}

// Update skala proporsional
function updateUniformScale(val: number) {
  if (!selectedObject.value) return
  const s = Number(val)
  selectedObject.value.scale = [s, s, s]
  if (selectedMeshInstance.value) {
    selectedMeshInstance.value.scale.set(s, s, s)
  }
}

// Set ke atas meja (tinggi meja 1.2 + offset tinggi objek 0.15 = 1.35)
function snapToTable() {
  updatePosition(1, 1.35)
}

// Warna preset untuk palet barang bukti
const presetColors = [
  '#f59e0b', // Amber
  '#38bdf8', // Sian cerah
  '#10b981', // Zamrud
  '#ef4444', // Merah
  '#a855f7', // Ungu
  '#ec4899', // Pink
  '#3b82f6', // Biru
  '#f8fafc', // Putih terang
]
</script>

<template>
  <div class="investigation-container">
    <!-- 3D Scene Viewport -->
    <TresCanvas v-bind="glOptions">
      <TresPerspectiveCamera :position="[5.5, 4.8, 6.8]" :look-at="[0, 1.3, 0]" />
      <OrbitControls
        :enabled="!isTransformDragging"
        :enable-damping="true"
        :damping-factor="0.05"
        :max-polar-angle="Math.PI / 2 - 0.02"
        :min-distance="1.8"
        :max-distance="16"
      />

      <!-- ================= PATAH CAHAYA RUANGAN (TERANG & BERSIH) ================= -->
      <!-- Cahaya Ambien Terang -->
      <TresAmbientLight :intensity="ambientIntensity" color="#ffffff" />

      <!-- Cahaya Atas-Bawah (Hemisphere) agar tidak ada bayangan gelap/hitam -->
      <TresHemisphereLight :args="['#f8fafc', '#64748b', hemisphereIntensity]" />

      <!-- Lampu Utama Ruangan (Directional / Sun Key Light) -->
      <TresDirectionalLight
        :position="[7, 12, 6]"
        :intensity="directionalIntensity"
        cast-shadow
        color="#ffffff"
      />

      <!-- Lampu Pengisi Lembut Dari Sisi Berlawanan (Fill Light) -->
      <TresDirectionalLight
        :position="[-7, 9, -5]"
        :intensity="directionalIntensity * 0.5"
        color="#e0f2fe"
      />

      <!-- Lampu Sorot Plafon Meja Investigasi (Ceiling Downlight) -->
      <TresSpotLight
        :position="[0, 7.5, 0]"
        :intensity="3.0"
        :angle="0.95"
        :penumbra="0.6"
        color="#fffbeb"
        cast-shadow
      />

      <!-- Lampu Aksen Neon Forensik -->
      <TresPointLight :position="[-3, 2.5, -2]" :intensity="1.5" color="#38bdf8" />
      <TresPointLight :position="[3, 2.5, 2]" :intensity="1.2" color="#fbbf24" />

      <!-- ================= STRUKTUR RUANGAN (ARSITEKTUR CERAH) ================= -->
      <!-- Lantai Ruangan Modern & Grid Cerah -->
      <TresGridHelper :args="[18, 18, '#818cf8', '#64748b']" :position="[0, 0.01, 0]" />
      <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, 0]" receive-shadow>
        <TresPlaneGeometry :args="[24, 24]" />
        <TresMeshStandardMaterial color="#475569" :roughness="0.35" :metalness="0.15" />
      </TresMesh>

      <!-- Dinding Belakang (Warna Abu-Abu Modern, Terang) -->
      <TresMesh :position="[0, 3.2, -4.2]" receive-shadow>
        <TresBoxGeometry :args="[12, 6.4, 0.2]" />
        <TresMeshStandardMaterial color="#64748b" :roughness="0.7" />
      </TresMesh>

      <!-- Papan Bukti Kasus (Investigation Corkboard) -->
      <TresMesh :position="[0, 3.2, -4.08]">
        <TresBoxGeometry :args="[7.2, 3.2, 0.06]" />
        <TresMeshStandardMaterial color="#b45309" :roughness="0.9" />
      </TresMesh>
      <TresMesh :position="[0, 3.2, -4.05]">
        <TresBoxGeometry :args="[6.8, 2.9, 0.04]" />
        <TresMeshStandardMaterial color="#fef3c7" :roughness="0.95" />
      </TresMesh>

      <!-- Catatan Bukti Pada Papan -->
      <TresMesh :position="[-1.8, 3.4, -4.02]" :rotation="[0, 0, 0.05]">
        <TresBoxGeometry :args="[1.0, 0.8, 0.02]" />
        <TresMeshStandardMaterial color="#fee2e2" />
      </TresMesh>
      <TresMesh :position="[0, 3.5, -4.02]" :rotation="[0, 0, -0.04]">
        <TresBoxGeometry :args="[1.2, 0.9, 0.02]" />
        <TresMeshStandardMaterial color="#e0e7ff" />
      </TresMesh>
      <TresMesh :position="[1.8, 3.3, -4.02]" :rotation="[0, 0, 0.03]">
        <TresBoxGeometry :args="[0.9, 0.8, 0.02]" />
        <TresMeshStandardMaterial color="#fef9c3" />
      </TresMesh>

      <!-- Dinding Samping Kiri -->
      <TresMesh :position="[-6, 3.2, 0]" :rotation="[0, Math.PI / 2, 0]" receive-shadow>
        <TresBoxGeometry :args="[8.4, 6.4, 0.2]" />
        <TresMeshStandardMaterial color="#475569" :roughness="0.7" />
      </TresMesh>

      <!-- Lampu Gantung Plafon (Ceiling Fixture Mesh) -->
      <TresMesh :position="[0, 7.2, 0]">
        <TresCylinderGeometry :args="[0.8, 0.8, 0.15, 32]" />
        <TresMeshStandardMaterial color="#f8fafc" :emissive="'#f8fafc'" :emissive-intensity="0.8" />
      </TresMesh>

      <!-- ================= MEJA INVESTIGASI UTAMA ================= -->
      <!-- Permukaan Meja (Warna Kayu Arang Elegan) -->
      <TresMesh :position="[0, 1.2, 0]" cast-shadow receive-shadow>
        <TresBoxGeometry :args="[4.4, 0.14, 2.4]" />
        <TresMeshStandardMaterial color="#334155" :roughness="0.25" :metalness="0.4" />
      </TresMesh>
      <!-- List Tepi Meja (Aksen Stainless) -->
      <TresMesh :position="[0, 1.2, 0]">
        <TresBoxGeometry :args="[4.44, 0.06, 2.44]" />
        <TresMeshStandardMaterial color="#94a3b8" :roughness="0.2" :metalness="0.9" />
      </TresMesh>

      <!-- 4 Kaki Meja Baja Kokoh -->
      <TresMesh :position="[-2.0, 0.6, -1.0]" cast-shadow>
        <TresCylinderGeometry :args="[0.06, 0.06, 1.2, 16]" />
        <TresMeshStandardMaterial color="#cbd5e1" :metalness="0.85" :roughness="0.2" />
      </TresMesh>
      <TresMesh :position="[2.0, 0.6, -1.0]" cast-shadow>
        <TresCylinderGeometry :args="[0.06, 0.06, 1.2, 16]" />
        <TresMeshStandardMaterial color="#cbd5e1" :metalness="0.85" :roughness="0.2" />
      </TresMesh>
      <TresMesh :position="[-2.0, 0.6, 1.0]" cast-shadow>
        <TresCylinderGeometry :args="[0.06, 0.06, 1.2, 16]" />
        <TresMeshStandardMaterial color="#cbd5e1" :metalness="0.85" :roughness="0.2" />
      </TresMesh>
      <TresMesh :position="[2.0, 0.6, 1.0]" cast-shadow>
        <TresCylinderGeometry :args="[0.06, 0.06, 1.2, 16]" />
        <TresMeshStandardMaterial color="#cbd5e1" :metalness="0.85" :roughness="0.2" />
      </TresMesh>

      <!-- ================= OBJEK INVESTIGASI DINAMIS ================= -->
      <TresMesh
        v-for="obj in objects"
        :key="obj.id"
        :ref="(el) => setMeshRef(obj.id, el)"
        :position="obj.position"
        :rotation="obj.rotation"
        :scale="obj.scale"
        cast-shadow
        receive-shadow
        @click.stop="selectObject(obj.id)"
      >
        <!-- Geometri Berdasarkan Tipe -->
        <TresBoxGeometry v-if="obj.type === 'box'" :args="(obj.args as any)" />
        <TresOctahedronGeometry v-else-if="obj.type === 'octahedron'" :args="(obj.args as any)" />
        <TresCylinderGeometry v-else-if="obj.type === 'cylinder'" :args="(obj.args as any)" />
        <TresSphereGeometry v-else-if="obj.type === 'sphere'" :args="(obj.args as any)" />
        <TresCapsuleGeometry v-else-if="obj.type === 'capsule'" :args="(obj.args as any)" />

        <!-- Material Objek dengan Highlight jika Dipilih -->
        <TresMeshStandardMaterial
          :color="obj.color"
          :roughness="obj.roughness"
          :metalness="obj.metalness"
          :emissive="selectedId === obj.id ? obj.color : '#000000'"
          :emissive-intensity="selectedId === obj.id ? 0.35 : 0"
        />
      </TresMesh>

      <!-- ================= 3D GIZMO TRANSFORM CONTROLS ================= -->
      <!-- Memungkinkan pengguna menggeser/memutar langsung di viewport 3D -->
      <TransformControls
        v-if="selectedMeshInstance"
        :object="selectedMeshInstance"
        :mode="transformMode"
        :size="0.75"
        @dragging="(isDragging) => (isTransformDragging = isDragging)"
        @object-change="syncTransformFromGizmo"
      />
    </TresCanvas>

    <!-- ================= UI HUD / PANEL KONTROL ================= -->
    <!-- Header Atas -->
    <header class="hud-header">
      <div class="header-left">
        <div class="brand">
          <span class="status-indicator"></span>
          <h1>RUANG INVESTIGASI 3D</h1>
        </div>
        <!-- Tombol Tambah Objek -->
        <button class="action-btn primary-btn" @click="showAddModal = true">
          <span class="btn-icon">➕</span> Tambah Objek Bukti
        </button>
        <!-- Tombol Daftar Objek -->
        <button class="action-btn secondary-btn" @click="showObjectList = !showObjectList">
          <span class="btn-icon">📁</span> Daftar Objek ({{ objects.length }})
        </button>
      </div>

      <!-- Kontrol Pencahayaan Cepat (Agar Tidak Gelap) -->
      <div class="header-right">
        <div class="lighting-switch">
          <span class="lighting-label">💡 Cahaya Ruangan:</span>
          <button
            :class="['light-btn', { active: lightingMode === 'bright' }]"
            title="Sangat Terang / Laboratorium Siang"
            @click="setLightingPreset('bright')"
          >
            ☀️ Terang
          </button>
          <button
            :class="['light-btn', { active: lightingMode === 'studio' }]"
            title="Pencahayaan Studio Seimbang"
            @click="setLightingPreset('studio')"
          >
            🏢 Studio
          </button>
          <button
            :class="['light-btn', { active: lightingMode === 'warm' }]"
            title="Pencahayaan Hangat"
            @click="setLightingPreset('warm')"
          >
            🌆 Hangat
          </button>
        </div>
      </div>
    </header>

    <!-- Floating Mode Gizmo Switcher (Tengah Atas) -->
    <div v-if="selectedObject" class="gizmo-mode-bar">
      <span class="gizmo-label">Mode Pengatur:</span>
      <button
        :class="['mode-btn', { active: transformMode === 'translate' }]"
        @click="transformMode = 'translate'"
        title="Geser Posisi (X, Y, Z)"
      >
        ↔️ Geser
      </button>
      <button
        :class="['mode-btn', { active: transformMode === 'rotate' }]"
        @click="transformMode = 'rotate'"
        title="Putar Objek"
      >
        🔄 Putar
      </button>
      <button
        :class="['mode-btn', { active: transformMode === 'scale' }]"
        @click="transformMode = 'scale'"
        title="Ubah Ukuran / Skala"
      >
        🔲 Skala
      </button>
    </div>

    <!-- Panel Inspektur / Pengatur Posisi Objek (Sisi Kanan) -->
    <aside v-if="selectedObject" class="inspector-card">
      <div class="inspector-header">
        <div class="inspector-title-area">
          <span class="badge-type">{{ selectedObject.type.toUpperCase() }}</span>
          <h2>{{ selectedObject.name }}</h2>
        </div>
        <button class="close-btn" @click="selectedId = null" title="Tutup">✕</button>
      </div>

      <div class="inspector-body">
        <p class="object-desc">{{ selectedObject.desc }}</p>

        <!-- KONTROL POSISI (X, Y, Z) -->
        <div class="control-group">
          <div class="group-header">
            <h3>📍 Posisi (Koordinat)</h3>
            <button class="mini-snap-btn" @click="snapToTable" title="Ratakan tepat di atas meja">
              ⬆️ Atas Meja
            </button>
          </div>

          <!-- Sumbu X -->
          <div class="coord-row">
            <span class="coord-axis axis-x">X</span>
            <input
              type="range"
              min="-3.5"
              max="3.5"
              step="0.05"
              :value="selectedObject.position[0]"
              @input="updatePosition(0, Number(($event.target as HTMLInputElement).value))"
            />
            <input
              type="number"
              step="0.1"
              class="coord-num-input"
              :value="selectedObject.position[0]"
              @change="updatePosition(0, Number(($event.target as HTMLInputElement).value))"
            />
          </div>

          <!-- Sumbu Y (Tinggi) -->
          <div class="coord-row">
            <span class="coord-axis axis-y">Y</span>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.05"
              :value="selectedObject.position[1]"
              @input="updatePosition(1, Number(($event.target as HTMLInputElement).value))"
            />
            <input
              type="number"
              step="0.1"
              class="coord-num-input"
              :value="selectedObject.position[1]"
              @change="updatePosition(1, Number(($event.target as HTMLInputElement).value))"
            />
          </div>

          <!-- Sumbu Z -->
          <div class="coord-row">
            <span class="coord-axis axis-z">Z</span>
            <input
              type="range"
              min="-2.5"
              max="2.5"
              step="0.05"
              :value="selectedObject.position[2]"
              @input="updatePosition(2, Number(($event.target as HTMLInputElement).value))"
            />
            <input
              type="number"
              step="0.1"
              class="coord-num-input"
              :value="selectedObject.position[2]"
              @change="updatePosition(2, Number(($event.target as HTMLInputElement).value))"
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
              @input="updateRotationY(Number(($event.target as HTMLInputElement).value))"
            />
            <span class="val-display">
              {{ Math.round(((selectedObject.rotation[1] % (2 * Math.PI)) * 180) / Math.PI) }}°
            </span>
          </div>

          <div class="coord-row">
            <span class="coord-axis">Skala</span>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              :value="selectedObject.scale[0]"
              @input="updateUniformScale(Number(($event.target as HTMLInputElement).value))"
            />
            <span class="val-display">{{ selectedObject.scale[0] }}x</span>
          </div>
        </div>

        <!-- PILIHAN WARNA OBJEK -->
        <div class="control-group">
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
          <button class="action-btn secondary-btn" @click="duplicateSelectedObject">
            📋 Salin Objek
          </button>
          <button class="action-btn danger-btn" @click="deleteSelectedObject">
            🗑️ Hapus Objek
          </button>
        </div>
      </div>
    </aside>

    <!-- Modal Pilihan Tambah Objek Baru -->
    <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>Pilih Objek Investigasi</h2>
            <p>Objek akan langsung ditempatkan di atas meja investigasi</p>
          </div>
          <button class="close-btn" @click="showAddModal = false">✕</button>
        </div>

        <div class="preset-grid">
          <div
            v-for="(p, i) in objectPresets"
            :key="i"
            class="preset-item"
            @click="addNewObject(p)"
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

    <!-- Drawer Daftar Seluruh Objek -->
    <div v-if="showObjectList" class="object-list-drawer">
      <div class="drawer-header">
        <h3>Daftar Objek di Ruangan</h3>
        <button class="close-btn" @click="showObjectList = false">✕</button>
      </div>
      <div class="drawer-items">
        <div
          v-for="item in objects"
          :key="item.id"
          :class="['drawer-item', { active: selectedId === item.id }]"
          @click="selectObject(item.id)"
        >
          <span class="item-color-tag" :style="{ backgroundColor: item.color }"></span>
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

    <!-- Bar Navigasi Bawah / Controls Hint -->
    <footer class="hud-footer">
      <div class="instruction-pill">
        <span>🖱️ <b>Klik Kiri + Geser:</b> Putar Sudut Pandang</span>
        <span>🔍 <b>Scroll:</b> Zoom Kamera</span>
        <span>🎯 <b>Klik Objek / Panah Gizmo:</b> Geser & Atur Posisi</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.investigation-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1e293b;
  user-select: none;
}

/* ================= HEADER HUD ================= */
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

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(14px);
  padding: 8px 18px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
}

.brand h1 {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #f8fafc;
  margin: 0;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 10px #10b981;
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

.danger-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}
.danger-btn:hover {
  background: #ef4444;
  color: #ffffff;
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
  transition: all 0.2s;
}

.light-btn:hover {
  color: #ffffff;
}

.light-btn.active {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

/* ================= GIZMO MODE BAR (TENGAH ATAS) ================= */
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

/* ================= PANEL INSPEKTUR OBJEK ================= */
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

/* Koordinat Baris */
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

/* Palet Warna */
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
.inspector-actions button {
  width: 100%;
  justify-content: center;
}

/* ================= MODAL TAMBAH OBJEK ================= */
.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
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
  width: 560px;
  max-width: 90vw;
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
  margin-bottom: 20px;
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

/* ================= DRAWER DAFTAR OBJEK ================= */
.object-list-drawer {
  position: absolute;
  top: 76px;
  left: 20px;
  width: 280px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  z-index: 20;
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
  font-size: 13px;
  color: #f8fafc;
  margin: 0;
}

.drawer-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.drawer-item:hover {
  background: rgba(51, 65, 85, 0.7);
}

.drawer-item.active {
  background: rgba(99, 102, 241, 0.25);
  border-color: #6366f1;
}

.item-color-tag {
  width: 12px;
  height: 12px;
  border-radius: 3px;
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
  color: #f1f5f9;
}

.item-pos {
  font-size: 10px;
  color: #94a3b8;
}

.item-active-check {
  font-size: 12px;
  color: #818cf8;
  font-weight: 700;
}

/* ================= FOOTER / INSTRUCTION ================= */
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
}

@media (max-width: 768px) {
  .hud-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .inspector-card {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
  .instruction-pill {
    display: none;
  }
}
</style>