<script setup lang="ts">
import { ref, computed, reactive, markRaw, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, TransformControls } from '@tresjs/cientos'
import {
  PCFShadowMap,
  SRGBColorSpace,
  Box3,
  Vector3,
  Group,
  Mesh,
  PerspectiveCamera,
  type Object3D,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

// Types & Constants
import type { InvestigationObject, Role, ObjectPreset } from '../types/investigation'
import { initialObjects, objectPresets } from '../constants/initialObjects'

// Composables
import { useLighting } from '../composables/useLighting'
import { useCharacterRigging } from '../composables/useCharacterRigging'
import { useStudentControls } from '../composables/useStudentControls'
import { useAIRoomGenerator } from '../composables/useAIRoomGenerator'

// Scene Subcomponents
import RoomArchitecture from './scene/RoomArchitecture.vue'
import RoomLighting from './scene/RoomLighting.vue'
import RiggedCharacter from './scene/RiggedCharacter.vue'
import DynamicObject from './scene/DynamicObject.vue'

// HUD Subcomponents
import HudHeader from './hud/HudHeader.vue'
import HudStudent from './hud/HudStudent.vue'
import HudLecturer from './hud/HudLecturer.vue'

// Modal Subcomponents
import AIRoomGeneratorModal from './modals/AIRoomGeneratorModal.vue'
import CharacterRiggingModal from './modals/CharacterRiggingModal.vue'
import StudentDossierModal from './modals/StudentDossierModal.vue'
import AddObjectModal from './modals/AddObjectModal.vue'

// ================= SISTEM DASAR RUANGAN =================
const currentRole = ref<Role>('dosen')

const glOptions = {
  clearColor: '#1e293b',
  shadows: true,
  shadowMapType: PCFShadowMap,
  outputColorSpace: SRGBColorSpace,
}

const cameraRef = ref<any>(null)
const showGridHelper = ref(false)

// State daftar objek investigasi
const objects = reactive<InvestigationObject[]>(JSON.parse(JSON.stringify(initialObjects)))

// Composable Pencahayaan Ruangan
const {
  lightingMode,
  ambientIntensity,
  directionalIntensity,
  hemisphereIntensity,
  showMainTable,
  setLightingPreset,
} = useLighting()

// Composable Karakter & Rigging
const characterRig = useCharacterRigging()

// Composable Eksplorasi Mahasiswa (WASD + Raycasting)
const studentControls = useStudentControls(currentRole, objects, cameraRef)

// Editor & Seleksi State
const selectedId = ref<string | null>('obj-crystal')
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate')
const isTransformDragging = ref(false)
const showAddModal = ref(false)
const showObjectList = ref(false)

// State Upload File 3D
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadProgressText = ref('')
const uploadError = ref<string | null>(null)
const uploadToast = ref<string | null>(null)
const isDraggingOverWindow = ref(false)

// Peta referensi Three.js Mesh
const meshInstances = new Map<string, Object3D>()

function setMeshRef(id: string, el: any) {
  if (el) {
    meshInstances.set(id, markRaw(el.instance || el))
  } else {
    meshInstances.delete(id)
  }
}

// Objek yang sedang aktif diseleksi
const selectedObject = computed(() => {
  if (selectedId.value === 'character-rig') {
    return {
      id: 'character-rig',
      name:
        characterRig.characterModelType.value === 'player1'
          ? 'Detektif Alex (Rigged Pria)'
          : 'Detektif Maya (Rigged Wanita)',
      desc: 'Karakter 3D ter-rigging dengan 44 sendi skeleton dan 41 animasi gerakan.',
      notes:
        'Karakter utama investigasi dilengkapi sistem skeletal rigging real-time dan controller animasi.',
      isInspected: false,
      type: 'custom_model',
      position: characterRig.characterPosition,
      rotation: characterRig.characterRotation,
      scale: [
        characterRig.characterScale.value,
        characterRig.characterScale.value,
        characterRig.characterScale.value,
      ],
      color: '#3b82f6',
      roughness: 0.3,
      metalness: 0.2,
      args: [],
    } as InvestigationObject
  }
  return objects.find((o) => o.id === selectedId.value) || null
})

const selectedMeshInstance = computed(() => {
  if (!selectedId.value) return null
  return meshInstances.get(selectedId.value) || null
})

// Composable AI Room Generator
const aiRoom = useAIRoomGenerator(
  objects,
  showMainTable,
  setLightingPreset,
  selectedId,
  uploadToast,
  showObjectList
)

// ================= HANDLER INTERAKSI & SELEKSI =================
function selectCharacterRig() {
  if (currentRole.value === 'dosen') {
    selectedId.value = 'character-rig'
    characterRig.showRiggingPanel.value = true
  } else {
    characterRig.playCharacterAnimation('Adult_TalkGestureActive')
    setTimeout(() => {
      if (characterRig.currentAnimationName.value === 'Adult_TalkGestureActive') {
        characterRig.playCharacterAnimation('Idle')
      }
    }, 3500)
  }
}

function selectObject(id: string) {
  if (id === 'character-rig') {
    selectCharacterRig()
    return
  }
  if (currentRole.value === 'dosen') {
    selectedId.value = id
  } else {
    const targetObj = objects.find((o) => o.id === id)
    if (targetObj) {
      studentControls.openDossier(targetObj)
    }
  }
}

function switchRole(role: Role) {
  currentRole.value = role
  const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera

  if (role === 'mahasiswa') {
    selectedId.value = null
    showAddModal.value = false
    showObjectList.value = false
    characterRig.showRiggingPanel.value = false
    studentControls.inspectedDossierObject.value = null

    if (cam) {
      studentControls.resetStudentCamera()
    }
  } else {
    studentControls.inspectedDossierObject.value = null
    studentControls.nearbyObject.value = null
    if (cam) {
      cam.position.set(5.5, 4.8, 6.8)
      cam.lookAt(0, 1.3, 0)
    }
    if (objects.length > 0) {
      selectedId.value = objects[0].id
    }
  }
}

// ================= LOGIKA UPLOAD & CRUD DOSEN =================
function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

function onFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    load3DModelFile(target.files[0])
  }
}

function onWindowDragOver(e: DragEvent) {
  e.preventDefault()
  if (currentRole.value === 'dosen') {
    isDraggingOverWindow.value = true
  }
}

function onWindowDragLeave(e: DragEvent) {
  e.preventDefault()
  if (e.relatedTarget === null) {
    isDraggingOverWindow.value = false
  }
}

function onWindowDrop(e: DragEvent) {
  e.preventDefault()
  isDraggingOverWindow.value = false
  if (currentRole.value === 'dosen' && e.dataTransfer && e.dataTransfer.files.length > 0) {
    load3DModelFile(e.dataTransfer.files[0])
  }
}

async function load3DModelFile(file: File) {
  isUploading.value = true
  uploadError.value = null
  uploadProgressText.value = `Membaca ${file.name}...`

  const fileName = file.name
  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  try {
    let rawGroup: Group

    if (ext === 'glb' || ext === 'gltf') {
      uploadProgressText.value = `Memproses model GLTF/GLB...`
      const arrayBuffer = await file.arrayBuffer()
      const loader = new GLTFLoader()
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.parse(arrayBuffer, '', resolve, reject)
      })
      rawGroup = gltf.scene as Group
    } else if (ext === 'obj') {
      uploadProgressText.value = `Memproses model OBJ...`
      const text = await file.text()
      const loader = new OBJLoader()
      rawGroup = loader.parse(text)
    } else {
      throw new Error(`Format .${ext} belum didukung. Silakan gunakan file .glb, .gltf, atau .obj!`)
    }

    rawGroup.traverse((child: any) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    const box = new Box3().setFromObject(rawGroup)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    rawGroup.position.x = -center.x
    rawGroup.position.y = -box.min.y
    rawGroup.position.z = -center.z

    const wrapper = new Group()
    wrapper.add(rawGroup)

    markRaw(rawGroup)
    markRaw(wrapper)

    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 0.75
    const scaleFactor = maxDim > 0 ? targetSize / maxDim : 1
    wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor)

    const randX = Number(((Math.random() - 0.5) * 2.2).toFixed(2))
    const randZ = Number(((Math.random() - 0.5) * 1.2).toFixed(2))

    const newId = `model-${Date.now()}`
    const baseName = fileName.replace(/\.[^/.]+$/, '')

    const newObj: InvestigationObject = {
      id: newId,
      name: baseName,
      desc: `Model 3D (.${ext.toUpperCase()}) yang diunggah langsung oleh Anda.`,
      notes: `Catatan investigasi: Periksa struktur model ${baseName} untuk mencari petunjuk lanjutan.`,
      isInspected: false,
      type: 'custom_model',
      position: [randX, 1.28, randZ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff',
      roughness: 0.4,
      metalness: 0.2,
      args: [],
      modelScene: markRaw(wrapper),
    }

    objects.push(newObj)
    selectedId.value = newId
    showAddModal.value = false
    showObjectList.value = true

    uploadToast.value = `Model "${baseName}" berhasil dimasukkan ke atas meja!`
    setTimeout(() => {
      uploadToast.value = null
    }, 4000)
  } catch (err: any) {
    console.error('Gagal memuat model 3D:', err)
    uploadError.value = err.message || 'Gagal memproses file 3D.'
  } finally {
    isUploading.value = false
    uploadProgressText.value = ''
  }
}

function addNewObject(preset: ObjectPreset) {
  const newId = `obj-${Date.now()}`
  const randX = Number(((Math.random() - 0.5) * 2.4).toFixed(2))
  const randZ = Number(((Math.random() - 0.5) * 1.3).toFixed(2))

  const newObj: InvestigationObject = {
    id: newId,
    name: `${preset.name} #${objects.length + 1}`,
    desc: preset.desc,
    notes: preset.notes,
    isInspected: false,
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
    modelScene: orig.modelScene ? markRaw(orig.modelScene.clone(true) as Group) : undefined,
  }
  objects.push(newObj)
  selectedId.value = newId
}

function deleteSelectedObject() {
  if (!selectedId.value) return
  if (selectedId.value === 'character-rig') {
    characterRig.showCharacterRig.value = false
    selectedId.value = objects.length > 0 ? objects[0].id : null
    return
  }
  const idx = objects.findIndex((o) => o.id === selectedId.value)
  if (idx !== -1) {
    meshInstances.delete(selectedId.value)
    objects.splice(idx, 1)
    selectedId.value = objects.length > 0 ? objects[0].id : null
  }
}

function syncTransformFromGizmo() {
  if (selectedId.value === 'character-rig') {
    if (selectedMeshInstance.value) {
      const mesh = selectedMeshInstance.value
      characterRig.characterPosition[0] = Number(mesh.position.x.toFixed(2))
      characterRig.characterPosition[1] = Number(mesh.position.y.toFixed(2))
      characterRig.characterPosition[2] = Number(mesh.position.z.toFixed(2))
      characterRig.characterRotation[0] = Number(mesh.rotation.x.toFixed(2))
      characterRig.characterRotation[1] = Number(mesh.rotation.y.toFixed(2))
      characterRig.characterRotation[2] = Number(mesh.rotation.z.toFixed(2))
      characterRig.characterScale.value = Number(mesh.scale.x.toFixed(2))
    }
    return
  }
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

function updatePosition(axis: 0 | 1 | 2, val: number) {
  if (selectedId.value === 'character-rig') {
    characterRig.characterPosition[axis] = Number(val)
    if (selectedMeshInstance.value) {
      if (axis === 0) selectedMeshInstance.value.position.x = Number(val)
      if (axis === 1) selectedMeshInstance.value.position.y = Number(val)
      if (axis === 2) selectedMeshInstance.value.position.z = Number(val)
    }
    return
  }
  if (!selectedObject.value) return
  selectedObject.value.position[axis] = Number(val)
  if (selectedMeshInstance.value) {
    if (axis === 0) selectedMeshInstance.value.position.x = Number(val)
    if (axis === 1) selectedMeshInstance.value.position.y = Number(val)
    if (axis === 2) selectedMeshInstance.value.position.z = Number(val)
  }
}

function updateRotationY(degrees: number) {
  if (selectedId.value === 'character-rig') {
    const rad = (degrees * Math.PI) / 180
    characterRig.characterRotation[1] = Number(rad.toFixed(2))
    if (selectedMeshInstance.value) {
      selectedMeshInstance.value.rotation.y = rad
    }
    return
  }
  if (!selectedObject.value) return
  const rad = (degrees * Math.PI) / 180
  selectedObject.value.rotation[1] = Number(rad.toFixed(2))
  if (selectedMeshInstance.value) {
    selectedMeshInstance.value.rotation.y = rad
  }
}

function updateUniformScale(val: number) {
  if (selectedId.value === 'character-rig') {
    const s = Number(val)
    characterRig.characterScale.value = s
    if (selectedMeshInstance.value) {
      selectedMeshInstance.value.scale.set(s, s, s)
    }
    return
  }
  if (!selectedObject.value) return
  const s = Number(val)
  selectedObject.value.scale = [s, s, s]
  if (selectedMeshInstance.value) {
    selectedMeshInstance.value.scale.set(s, s, s)
  }
}

function snapToTable() {
  if (selectedId.value === 'character-rig') {
    updatePosition(1, 0)
    return
  }
  const tableY = selectedObject.value?.type === 'custom_model' ? 1.28 : 1.35
  updatePosition(1, tableY)
}

// ================= ANIMATION FRAME LOOP =================
let animId: number | null = null
let lastTime = performance.now()

function loopTick(time: number) {
  const delta = Math.min((time - lastTime) / 1000, 0.1)
  lastTime = time

  // Update animasi karakter rigging
  characterRig.updateMixer(delta)

  // Update garis kerangka skeleton rigging saat aktif
  if (characterRig.showSkeletonRig.value && characterRig.skeletonHelperRef.value) {
    characterRig.skeletonHelperRef.value.updateMatrixWorld(true)
  }

  // Update eksplorasi dan interaksi mahasiswa
  if (currentRole.value === 'mahasiswa') {
    studentControls.handleStudentMovement(delta)
    studentControls.updateNearbyInteraction()
  }

  animId = requestAnimationFrame(loopTick)
}

onMounted(() => {
  window.addEventListener('keydown', studentControls.onKeyDown)
  window.addEventListener('keyup', studentControls.onKeyUp)
  window.addEventListener('mousemove', studentControls.onWindowPointerMove)
  window.addEventListener('mouseup', studentControls.onWindowPointerUp)

  lastTime = performance.now()
  animId = requestAnimationFrame(loopTick)

  // Muat Karakter Rigged awal
  characterRig.loadRiggedCharacter(characterRig.characterModelType.value)
})

onUnmounted(() => {
  window.removeEventListener('keydown', studentControls.onKeyDown)
  window.removeEventListener('keyup', studentControls.onKeyUp)
  window.removeEventListener('mousemove', studentControls.onWindowPointerMove)
  window.removeEventListener('mouseup', studentControls.onWindowPointerUp)
  if (animId !== null) cancelAnimationFrame(animId)
})
</script>

<template>
  <div
    class="investigation-container"
    @dragover="onWindowDragOver"
    @dragleave="onWindowDragLeave"
    @drop="onWindowDrop"
    @mousedown="studentControls.onCanvasPointerDown"
  >
    <input
      ref="fileInputRef"
      type="file"
      accept=".glb,.gltf,.obj"
      class="hidden-file-input"
      @change="onFileInputChange"
    />

    <!-- Overlay Drag & Drop Layar Penuh (Dosen) -->
    <div v-if="isDraggingOverWindow && currentRole === 'dosen'" class="drop-overlay">
      <div class="drop-modal-box">
        <span class="drop-icon">📥</span>
        <h3>Lepaskan File Model 3D di Sini</h3>
        <p>File .glb, .gltf, atau .obj akan langsung diletakkan di atas meja investigasi</p>
      </div>
    </div>

    <!-- Toast Notifikasi Sukses -->
    <div v-if="uploadToast" class="toast-success">
      <span class="toast-icon">✨</span>
      <span>{{ uploadToast }}</span>
    </div>

    <!-- 3D Scene Viewport -->
    <TresCanvas v-bind="glOptions">
      <TresPerspectiveCamera ref="cameraRef" :position="[5.5, 4.8, 6.8]" :look-at="[0, 1.3, 0]" />

      <!-- Kontrol Kamera Mode Dosen (Orbit 360) -->
      <OrbitControls
        v-if="currentRole === 'dosen'"
        :enabled="!isTransformDragging"
        :enable-damping="true"
        :damping-factor="0.05"
        :max-polar-angle="Math.PI / 2 - 0.02"
        :min-distance="1.8"
        :max-distance="16"
      />

      <!-- Tata Cahaya Ruangan -->
      <RoomLighting
        :lighting-mode="lightingMode"
        :ambient-intensity="ambientIntensity"
        :directional-intensity="directionalIntensity"
        :hemisphere-intensity="hemisphereIntensity"
      />

      <!-- Arsitektur Ruangan (Lantai, Dinding, Papan Kasus, Meja Utama) -->
      <RoomArchitecture
        :show-grid-helper="showGridHelper"
        :show-main-table="showMainTable"
      />

      <!-- Karakter Rigged Investigator -->
      <RiggedCharacter
        :show-character-rig="characterRig.showCharacterRig.value"
        :character-scene="characterRig.characterScene.value"
        :character-position="characterRig.characterPosition"
        :character-rotation="characterRig.characterRotation"
        :character-scale="characterRig.characterScale.value"
        :show-skeleton-rig="characterRig.showSkeletonRig.value"
        :skeleton-helper-ref="characterRig.skeletonHelperRef.value"
        :set-mesh-ref="setMeshRef"
        @select="selectCharacterRig"
      />

      <!-- Daftar Objek Investigasi Dinamis -->
      <DynamicObject
        v-for="obj in objects"
        :key="obj.id"
        :obj="obj"
        :current-role="currentRole"
        :is-selected="selectedId === obj.id"
        :is-nearby="studentControls.nearbyObject.value?.id === obj.id"
        :set-mesh-ref="setMeshRef"
        @select="selectObject"
      />

      <!-- 3D Transform Gizmo (Hanya di Mode Dosen) -->
      <TransformControls
        v-if="currentRole === 'dosen' && selectedMeshInstance"
        :object="selectedMeshInstance"
        :mode="transformMode"
        :size="0.75"
        @dragging="(isDragging) => (isTransformDragging = isDragging)"
        @object-change="syncTransformFromGizmo"
      />
    </TresCanvas>

    <!-- HUD Header (Top Bar) -->
    <HudHeader
      :current-role="currentRole"
      :objects-count="objects.length"
      :show-rigging-panel="characterRig.showRiggingPanel.value"
      :show-skeleton-rig="characterRig.showSkeletonRig.value"
      :show-main-table="showMainTable"
      :show-grid-helper="showGridHelper"
      :lighting-mode="lightingMode"
      @switch-role="switchRole"
      @trigger-file-input="triggerFileInput"
      @open-add-modal="showAddModal = true"
      @toggle-object-list="showObjectList = !showObjectList"
      @toggle-rigging-panel="characterRig.showRiggingPanel.value = !characterRig.showRiggingPanel.value"
      @open-a-i-generator="aiRoom.openAIGenerator"
      @toggle-main-table="showMainTable = !showMainTable"
      @toggle-grid-helper="showGridHelper = !showGridHelper"
      @set-lighting-preset="setLightingPreset"
    />

    <!-- HUD Mahasiswa (Crosshair, Prompt [E], Progress, Navigasi) -->
    <HudStudent
      v-if="currentRole === 'mahasiswa'"
      :nearby-object="studentControls.nearbyObject.value"
      :inspected-count="studentControls.inspectedCount.value"
      :total-count="objects.length"
      @open-dossier="studentControls.openDossier"
    />

    <!-- HUD Dosen (Gizmo Switcher, Drawer Daftar Objek, Inspector Panel, Footer) -->
    <HudLecturer
      v-if="currentRole === 'dosen'"
      :selected-object="selectedObject"
      :selected-id="selectedId"
      :transform-mode="transformMode"
      :show-object-list="showObjectList"
      :objects="objects"
      @update:transform-mode="transformMode = $event"
      @close-inspector="selectedId = null"
      @select-object="selectObject"
      @close-object-list="showObjectList = false"
      @duplicate-object="duplicateSelectedObject"
      @delete-object="deleteSelectedObject"
      @snap-to-table="snapToTable"
      @update-position="(axis, val) => updatePosition(axis as 0 | 1 | 2, val)"
      @update-rotation-y="updateRotationY"
      @update-scale="updateUniformScale"
    />

    <!-- Modals -->
    <AIRoomGeneratorModal
      :ai="aiRoom"
      :current-role="currentRole"
    />

    <CharacterRiggingModal
      :rig="characterRig"
    />

    <StudentDossierModal
      :inspected-object="studentControls.inspectedDossierObject.value"
      @close="studentControls.closeDossier"
      @toggle-inspected="studentControls.toggleInspected"
    />

    <AddObjectModal
      :show="showAddModal && currentRole === 'dosen'"
      :upload-error="uploadError"
      :presets="objectPresets"
      @close="showAddModal = false"
      @trigger-file-input="triggerFileInput"
      @add-preset="addNewObject"
    />

    <!-- Loading Indicator Saat Uploading Model -->
    <div v-if="isUploading" class="upload-loading-overlay">
      <div class="loading-box">
        <div class="spinner"></div>
        <h4>{{ uploadProgressText }}</h4>
        <p>Model sedang diproses dan dioptimasi untuk meja 3D...</p>
      </div>
    </div>
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

.hidden-file-input {
  display: none;
}

/* ================= OVERLAY DRAG & DROP LAYAR PENUH ================= */
.drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
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

.drop-modal-box {
  background: rgba(30, 41, 59, 0.95);
  border: 2px dashed #6366f1;
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  max-width: 480px;
}

.drop-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.drop-modal-box h3 {
  font-size: 20px;
  color: #f8fafc;
  margin: 0 0 8px 0;
}

.drop-modal-box p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* ================= TOAST NOTIFIKASI ================= */
.toast-success {
  position: absolute;
  top: 76px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(16, 185, 129, 0.92);
  backdrop-filter: blur(12px);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
  z-index: 60;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -15px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* ================= UPLOAD LOADING OVERLAY ================= */
.upload-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 80;
}

.loading-box {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 32px 40px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-box h4 {
  font-size: 15px;
  color: #f8fafc;
  margin: 0 0 6px 0;
}

.loading-box p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}
</style>