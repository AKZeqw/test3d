<script setup lang="ts">
import { ref, computed, reactive, markRaw, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, TransformControls } from '@tresjs/cientos'
import {
  BasicShadowMap,
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

// ================= TIPE DATA =================
export interface InvestigationObject {
  id: string
  name: string
  desc: string
  notes?: string // Catatan / arahan Dosen untuk Mahasiswa
  isInspected?: boolean // Status pemeriksaan oleh Mahasiswa
  type: 'box' | 'octahedron' | 'cylinder' | 'sphere' | 'capsule' | 'custom_model'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  roughness: number
  metalness: number
  args: number[]
  modelScene?: Group
}

// ================= SISTEM ROLE =================
// 'dosen': Creator/Editor mode (Orbit camera, add/upload objects, move with gizmo, set notes)
// 'mahasiswa': Explorer mode (First-person walking with WASD, mouse look, examine evidence [E])
const currentRole = ref<'dosen' | 'mahasiswa'>('dosen')

// Opsi rendering canvas
const glOptions = {
  clearColor: '#202938',
  shadows: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
}

// Referensi kamera Three.js
const cameraRef = ref<any>(null)

// Kontrol pencahayaan ruangan
const lightingMode = ref<'bright' | 'studio' | 'warm'>('bright')
const ambientIntensity = ref(1.6)
const directionalIntensity = ref(2.2)
const hemisphereIntensity = ref(1.2)

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

// ================= DAFTAR OBJEK =================
const objects = reactive<InvestigationObject[]>([
  {
    id: 'obj-dossier',
    name: 'Dokumen Rahasia',
    desc: 'Berkas dossier investigasi kasus nomor #102.',
    notes:
      'Dossier ini berisi rekaman transaksi mencurigakan tertanggal 12 September 2026. Analisis stempel forensik menunjukkan dokumen ini dipalsukan.',
    isInspected: false,
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
    desc: 'Sampel kristal mineral nomor bukti #09 ditemukan di TKP.',
    notes:
      'Sampel mineral anomali memancarkan resonansi cahaya ringan. Diduga berasal dari fasilitas sintesis material laboratorium.',
    isInspected: true,
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
    desc: 'Penyimpanan bukti digital dengan kunci enkripsi.',
    notes:
      'Brankas biometrik portabel terkunci rapat. Port USB di sisi kanan menunjukkan ada percobaan ekstraksi data sebelum tersangka kabur.',
    isInspected: false,
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

// Preset untuk Dosen menambah objek baru
const objectPresets = [
  {
    type: 'box' as const,
    name: 'Koper Bukti Forensik',
    desc: 'Koper alumunium berisi alat forensik TKP.',
    notes: 'Koper milik tim identifikasi, berisi kit uji luminol dan pemindai serbuk sidik jari.',
    color: '#64748b',
    args: [0.8, 0.25, 0.6],
    roughness: 0.3,
    metalness: 0.7,
  },
  {
    type: 'cylinder' as const,
    name: 'Tabung Sampel Kimia',
    desc: 'Tabung silinder cairan bukti kimiawi.',
    notes: 'Cairan hijau pekat mengandung zat akseleran pembakaran.',
    color: '#10b981',
    args: [0.12, 0.12, 0.45, 32],
    roughness: 0.1,
    metalness: 0.5,
  },
  {
    type: 'sphere' as const,
    name: 'Sensor Digital TKP',
    desc: 'Orbe sensor pemindai 3D portabel.',
    notes: 'Alat pemindai lidar yang merekam posisi millimeter tiap serpihan di TKP.',
    color: '#a855f7',
    args: [0.22, 32, 32],
    roughness: 0.1,
    metalness: 0.9,
  },
  {
    type: 'capsule' as const,
    name: 'Kapsul Bukti Nanotech',
    desc: 'Kapsul penyimpan microchip bukti.',
    notes: 'Microchip terenkripsi tingkat tinggi ditemukan tersembunyi di bawah lantai.',
    color: '#ec4899',
    args: [0.12, 0.3, 16, 32],
    roughness: 0.2,
    metalness: 0.6,
  },
  {
    type: 'box' as const,
    name: 'Kotak Arsip Dokumen',
    desc: 'Kardus penyimpanan berkas perkara lampau.',
    notes: 'Berkas kasus lama yang dibuka kembali karena adanya kesamaan pola sidik jari.',
    color: '#d97706',
    args: [0.6, 0.4, 0.5],
    roughness: 0.8,
    metalness: 0.05,
  },
  {
    type: 'octahedron' as const,
    name: 'Permata Bukti Sitaan',
    desc: 'Batu permata bernilai tinggi dari brankas.',
    notes: 'Hasil penyelundupan permata ilegal yang belum terdaftar di bea cukai.',
    color: '#ef4444',
    args: [0.25],
    roughness: 0.1,
    metalness: 0.95,
  },
]

// ================= STATE EDITOR & SELEKSI =================
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

const selectedObject = computed(() => {
  return objects.find((o) => o.id === selectedId.value) || null
})

const selectedMeshInstance = computed(() => {
  if (!selectedId.value) return null
  return meshInstances.get(selectedId.value) || null
})

function selectObject(id: string) {
  if (currentRole.value === 'dosen') {
    selectedId.value = id
  } else {
    // Di mode Mahasiswa: klik objek langsung membuka dossier pemeriksaan bukti
    const targetObj = objects.find((o) => o.id === id)
    if (targetObj) {
      openDossier(targetObj)
    }
  }
}

// ================= SISTEM EKSPLORASI MAHASISWA (WALK & INTERACTION) =================
const nearbyObject = ref<InvestigationObject | null>(null)
const inspectedDossierObject = ref<InvestigationObject | null>(null)

// Hitung berapa bukti yang sudah diperiksa
const inspectedCount = computed(() => objects.filter((o) => o.isInspected).length)

// State tombol keyboard
const keysPressed = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

// Rotasi pandangan mouse di mode Mahasiswa
let isMouseDownOnCanvas = false
let prevMouseX = 0
let prevMouseY = 0
let cameraYaw = 0
let cameraPitch = 0

// Handler switch role (Dosen <-> Mahasiswa)
function switchRole(role: 'dosen' | 'mahasiswa') {
  currentRole.value = role
  const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera

  if (role === 'mahasiswa') {
    // Tutup panel editor Dosen
    selectedId.value = null
    showAddModal.value = false
    showObjectList.value = false
    inspectedDossierObject.value = null

    // Posisikan Mahasiswa berdiri di depan meja (tinggi mata 1.7m)
    if (cam) {
      cam.position.set(0, 1.7, 3.8)
      cam.lookAt(0, 1.3, 0)
      cam.rotation.order = 'YXZ'
      cameraYaw = 0
      cameraPitch = 0
    }
  } else {
    // Kembali ke sudut pandang bird-eye/overview Dosen
    inspectedDossierObject.value = null
    nearbyObject.value = null
    if (cam) {
      cam.position.set(5.5, 4.8, 6.8)
      cam.lookAt(0, 1.3, 0)
    }
    if (objects.length > 0) {
      selectedId.value = objects[0].id
    }
  }
}

// Buka dan tutup modal dossier bukti untuk Mahasiswa
function openDossier(obj: InvestigationObject) {
  inspectedDossierObject.value = obj
}

function closeDossier() {
  inspectedDossierObject.value = null
}

function toggleInspected(obj: InvestigationObject) {
  obj.isInspected = !obj.isInspected
}

// Logika pergerakan berjalan Mahasiswa (WASD)
function handleStudentMovement(delta: number) {
  if (inspectedDossierObject.value) return // Tidak bergerak jika sedang baca dokumen bukti

  const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera
  if (!cam) return

  const isMovingForward = keysPressed.w || keysPressed.ArrowUp
  const isMovingBackward = keysPressed.s || keysPressed.ArrowDown
  const isMovingLeft = keysPressed.a || keysPressed.ArrowLeft
  const isMovingRight = keysPressed.d || keysPressed.ArrowRight

  if (isMovingForward || isMovingBackward || isMovingLeft || isMovingRight) {
    const walkSpeed = 3.6 * delta // Kecepatan berjalan nyaman
    const forward = new Vector3()
    cam.getWorldDirection(forward)
    forward.y = 0 // Tetap di bidang datar
    forward.normalize()

    const right = new Vector3()
    right.crossVectors(forward, new Vector3(0, 1, 0)).normalize()

    const moveDir = new Vector3()
    if (isMovingForward) moveDir.add(forward)
    if (isMovingBackward) moveDir.sub(forward)
    if (isMovingRight) moveDir.add(right)
    if (isMovingLeft) moveDir.sub(right)

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().multiplyScalar(walkSpeed)

      const nextX = cam.position.x + moveDir.x
      const nextZ = cam.position.z + moveDir.z

      // 1. Batas Dinding Ruangan (Agar tidak tembus dinding)
      const clampedX = Math.max(-5.2, Math.min(5.2, nextX))
      const clampedZ = Math.max(-3.4, Math.min(5.2, nextZ))

      // 2. Tabrakan Meja Investigasi (Dimensi meja X: -2.3 s/d 2.3, Z: -1.35 s/d 1.35)
      const insideTableX = clampedX > -2.4 && clampedX < 2.4
      const insideTableZ = clampedZ > -1.4 && clampedZ < 1.4

      if (insideTableX && insideTableZ) {
        // Efek sliding: meluncur di sisi meja jika satu sumbu bebas
        const prevX = cam.position.x
        const prevZ = cam.position.z
        if (prevZ < -1.4 || prevZ > 1.4) cam.position.x = clampedX
        if (prevX < -2.4 || prevX > 2.4) cam.position.z = clampedZ
      } else {
        cam.position.x = clampedX
        cam.position.z = clampedZ
      }
    }
  }

  // Jaga ketinggian mata tetap konstan di 1.7m (eye-level)
  cam.position.y = 1.7
}

// Deteksi objek bukti terdekat yang sedang diarahkan oleh Mahasiswa
function updateNearbyInteraction() {
  const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera
  if (!cam) return

  const camPos = cam.position
  const camDir = new Vector3()
  cam.getWorldDirection(camDir)

  let closest: InvestigationObject | null = null
  let minDist = 2.8 // Jarak maksimal interaksi 2.8 meter

  for (const obj of objects) {
    const objPos = new Vector3(obj.position[0], obj.position[1], obj.position[2])
    const dist = camPos.distanceTo(objPos)

    if (dist < minDist) {
      const toObj = objPos.clone().sub(camPos).normalize()
      const dot = camDir.dot(toObj)
      // Sudut pandang kerucut (~65 derajat) menghadap objek
      if (dot > 0.45) {
        minDist = dist
        closest = obj
      }
    }
  }

  nearbyObject.value = closest
}

// Mouse Drag Look untuk Mahasiswa
function onCanvasPointerDown(e: MouseEvent) {
  if (currentRole.value === 'mahasiswa' && !inspectedDossierObject.value) {
    isMouseDownOnCanvas = true
    prevMouseX = e.clientX
    prevMouseY = e.clientY
  }
}

function onWindowPointerMove(e: MouseEvent) {
  if (currentRole.value === 'mahasiswa' && isMouseDownOnCanvas && !inspectedDossierObject.value) {
    const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera
    if (!cam) return

    const deltaX = e.clientX - prevMouseX
    const deltaY = e.clientY - prevMouseY
    prevMouseX = e.clientX
    prevMouseY = e.clientY

    const sensitivity = 0.0032
    cameraYaw -= deltaX * sensitivity
    cameraPitch -= deltaY * sensitivity

    // Batasi sudut dongak/tunduk (-70° s/d 70°)
    const maxPitch = (70 * Math.PI) / 180
    cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, cameraPitch))

    cam.rotation.order = 'YXZ'
    cam.rotation.y = cameraYaw
    cam.rotation.x = cameraPitch
    cam.rotation.z = 0
  }
}

function onWindowPointerUp() {
  isMouseDownOnCanvas = false
}

// Keyboard events
function onKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    return
  }

  const k = e.key
  if (k === 'w' || k === 'W') keysPressed.w = true
  if (k === 's' || k === 'S') keysPressed.s = true
  if (k === 'a' || k === 'A') keysPressed.a = true
  if (k === 'd' || k === 'D') keysPressed.d = true
  if (k === 'ArrowUp') keysPressed.ArrowUp = true
  if (k === 'ArrowDown') keysPressed.ArrowDown = true
  if (k === 'ArrowLeft') keysPressed.ArrowLeft = true
  if (k === 'ArrowRight') keysPressed.ArrowRight = true

  // Interaksi tombol [E]
  if ((k === 'e' || k === 'E') && currentRole.value === 'mahasiswa') {
    if (nearbyObject.value && !inspectedDossierObject.value) {
      openDossier(nearbyObject.value)
    } else if (inspectedDossierObject.value) {
      closeDossier()
    }
  }

  // Tutup dengan ESC
  if (k === 'Escape' && inspectedDossierObject.value) {
    closeDossier()
  }
}

function onKeyUp(e: KeyboardEvent) {
  const k = e.key
  if (k === 'w' || k === 'W') keysPressed.w = false
  if (k === 's' || k === 'S') keysPressed.s = false
  if (k === 'a' || k === 'A') keysPressed.a = false
  if (k === 'd' || k === 'D') keysPressed.d = false
  if (k === 'ArrowUp') keysPressed.ArrowUp = false
  if (k === 'ArrowDown') keysPressed.ArrowDown = false
  if (k === 'ArrowLeft') keysPressed.ArrowLeft = false
  if (k === 'ArrowRight') keysPressed.ArrowRight = false
}

// Animation frame loop untuk eksplorasi mahasiswa
let animId: number | null = null
let lastTime = performance.now()

function loopTick(time: number) {
  const delta = Math.min((time - lastTime) / 1000, 0.1)
  lastTime = time

  if (currentRole.value === 'mahasiswa') {
    handleStudentMovement(delta)
    updateNearbyInteraction()
  }

  animId = requestAnimationFrame(loopTick)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onWindowPointerMove)
  window.addEventListener('mouseup', onWindowPointerUp)
  lastTime = performance.now()
  animId = requestAnimationFrame(loopTick)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mousemove', onWindowPointerMove)
  window.removeEventListener('mouseup', onWindowPointerUp)
  if (animId !== null) cancelAnimationFrame(animId)
})

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

function addNewObject(preset: (typeof objectPresets)[number]) {
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
  const idx = objects.findIndex((o) => o.id === selectedId.value)
  if (idx !== -1) {
    meshInstances.delete(selectedId.value)
    objects.splice(idx, 1)
    selectedId.value = objects.length > 0 ? objects[0].id : null
  }
}

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

function updatePosition(axis: 0 | 1 | 2, val: number) {
  if (!selectedObject.value) return
  selectedObject.value.position[axis] = Number(val)
  if (selectedMeshInstance.value) {
    if (axis === 0) selectedMeshInstance.value.position.x = Number(val)
    if (axis === 1) selectedMeshInstance.value.position.y = Number(val)
    if (axis === 2) selectedMeshInstance.value.position.z = Number(val)
  }
}

function updateRotationY(degrees: number) {
  if (!selectedObject.value) return
  const rad = (degrees * Math.PI) / 180
  selectedObject.value.rotation[1] = Number(rad.toFixed(2))
  if (selectedMeshInstance.value) {
    selectedMeshInstance.value.rotation.y = rad
  }
}

function updateUniformScale(val: number) {
  if (!selectedObject.value) return
  const s = Number(val)
  selectedObject.value.scale = [s, s, s]
  if (selectedMeshInstance.value) {
    selectedMeshInstance.value.scale.set(s, s, s)
  }
}

function snapToTable() {
  const tableY = selectedObject.value?.type === 'custom_model' ? 1.28 : 1.35
  updatePosition(1, tableY)
}

const presetColors = [
  '#f59e0b',
  '#38bdf8',
  '#10b981',
  '#ef4444',
  '#a855f7',
  '#ec4899',
  '#3b82f6',
  '#f8fafc',
]
</script>

<template>
  <div
    class="investigation-container"
    @dragover="onWindowDragOver"
    @dragleave="onWindowDragLeave"
    @drop="onWindowDrop"
    @mousedown="onCanvasPointerDown"
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

      <!-- ================= TATA CAHAYA RUANGAN (TERANG & BERSIH) ================= -->
      <TresAmbientLight :intensity="ambientIntensity" color="#ffffff" />
      <TresHemisphereLight :args="['#f8fafc', '#64748b', hemisphereIntensity]" />
      <TresDirectionalLight
        :position="[7, 12, 6]"
        :intensity="directionalIntensity"
        cast-shadow
        color="#ffffff"
      />
      <TresDirectionalLight
        :position="[-7, 9, -5]"
        :intensity="directionalIntensity * 0.5"
        color="#e0f2fe"
      />
      <TresSpotLight
        :position="[0, 7.5, 0]"
        :intensity="3.0"
        :angle="0.95"
        :penumbra="0.6"
        color="#fffbeb"
        cast-shadow
      />
      <TresPointLight :position="[-3, 2.5, -2]" :intensity="1.5" color="#38bdf8" />
      <TresPointLight :position="[3, 2.5, 2]" :intensity="1.2" color="#fbbf24" />

      <!-- ================= ARSITEKTUR RUANGAN CERAH ================= -->
      <TresGridHelper :args="[18, 18, '#818cf8', '#64748b']" :position="[0, 0.01, 0]" />
      <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, 0]" receive-shadow>
        <TresPlaneGeometry :args="[24, 24]" />
        <TresMeshStandardMaterial color="#475569" :roughness="0.35" :metalness="0.15" />
      </TresMesh>

      <!-- Dinding & Papan Kasus -->
      <TresMesh :position="[0, 3.2, -4.2]" receive-shadow>
        <TresBoxGeometry :args="[12, 6.4, 0.2]" />
        <TresMeshStandardMaterial color="#64748b" :roughness="0.7" />
      </TresMesh>
      <TresMesh :position="[0, 3.2, -4.08]">
        <TresBoxGeometry :args="[7.2, 3.2, 0.06]" />
        <TresMeshStandardMaterial color="#b45309" :roughness="0.9" />
      </TresMesh>
      <TresMesh :position="[0, 3.2, -4.05]">
        <TresBoxGeometry :args="[6.8, 2.9, 0.04]" />
        <TresMeshStandardMaterial color="#fef3c7" :roughness="0.95" />
      </TresMesh>

      <!-- Catatan Papan -->
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

      <TresMesh :position="[-6, 3.2, 0]" :rotation="[0, Math.PI / 2, 0]" receive-shadow>
        <TresBoxGeometry :args="[8.4, 6.4, 0.2]" />
        <TresMeshStandardMaterial color="#475569" :roughness="0.7" />
      </TresMesh>

      <!-- Lampu Plafon -->
      <TresMesh :position="[0, 7.2, 0]">
        <TresCylinderGeometry :args="[0.8, 0.8, 0.15, 32]" />
        <TresMeshStandardMaterial color="#f8fafc" :emissive="'#f8fafc'" :emissive-intensity="0.8" />
      </TresMesh>

      <!-- ================= MEJA INVESTIGASI UTAMA ================= -->
      <TresMesh :position="[0, 1.2, 0]" cast-shadow receive-shadow>
        <TresBoxGeometry :args="[4.4, 0.14, 2.4]" />
        <TresMeshStandardMaterial color="#334155" :roughness="0.25" :metalness="0.4" />
      </TresMesh>
      <TresMesh :position="[0, 1.2, 0]">
        <TresBoxGeometry :args="[4.44, 0.06, 2.44]" />
        <TresMeshStandardMaterial color="#94a3b8" :roughness="0.2" :metalness="0.9" />
      </TresMesh>

      <!-- 4 Kaki Meja -->
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
      <template v-for="obj in objects" :key="obj.id">
        <!-- Model 3D yang Diunggah (.glb, .gltf, .obj) -->
        <primitive
          v-if="obj.type === 'custom_model' && obj.modelScene"
          :object="obj.modelScene"
          :ref="(el: any) => setMeshRef(obj.id, el)"
          :position="obj.position"
          :rotation="obj.rotation"
          :scale="obj.scale"
          @click.stop="selectObject(obj.id)"
        />

        <!-- Objek Geometri Bawaan -->
        <TresMesh
          v-else
          :ref="(el: any) => setMeshRef(obj.id, el)"
          :position="obj.position"
          :rotation="obj.rotation"
          :scale="obj.scale"
          cast-shadow
          receive-shadow
          @click.stop="selectObject(obj.id)"
        >
          <TresBoxGeometry v-if="obj.type === 'box'" :args="(obj.args as any)" />
          <TresOctahedronGeometry v-else-if="obj.type === 'octahedron'" :args="(obj.args as any)" />
          <TresCylinderGeometry v-else-if="obj.type === 'cylinder'" :args="(obj.args as any)" />
          <TresSphereGeometry v-else-if="obj.type === 'sphere'" :args="(obj.args as any)" />
          <TresCapsuleGeometry v-else-if="obj.type === 'capsule'" :args="(obj.args as any)" />

          <!-- Material dengan Highlight Seleksi (Dosen) atau Indikator Diperiksa (Mahasiswa) -->
          <TresMeshStandardMaterial
            :color="obj.color"
            :roughness="obj.roughness"
            :metalness="obj.metalness"
            :emissive="
              currentRole === 'dosen' && selectedId === obj.id
                ? obj.color
                : currentRole === 'mahasiswa' && nearbyObject?.id === obj.id
                  ? '#ffffff'
                  : '#000000'
            "
            :emissive-intensity="
              currentRole === 'dosen' && selectedId === obj.id
                ? 0.4
                : currentRole === 'mahasiswa' && nearbyObject?.id === obj.id
                  ? 0.3
                  : 0
            "
          />
        </TresMesh>
      </template>

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

    <!-- ================= HUD HEADER ================= -->
    <header class="hud-header">
      <div class="header-left">
        <!-- ROLE SELECTOR SWITCHER -->
        <div class="role-selector-pill">
          <button
            :class="['role-btn', { active: currentRole === 'dosen' }]"
            @click="switchRole('dosen')"
            title="Mode Dosen: Kelola dan atur tata letak ruang investigasi"
          >
            👨‍🏫 Mode Dosen
          </button>
          <button
            :class="['role-btn', { active: currentRole === 'mahasiswa' }]"
            @click="switchRole('mahasiswa')"
            title="Mode Mahasiswa: Berjalan langsung (WASD) dan telusuri bukti kasus"
          >
            👨‍🎓 Mode Mahasiswa
          </button>
        </div>

        <!-- Tombol Aksi Khusus Dosen -->
        <template v-if="currentRole === 'dosen'">
          <button class="action-btn upload-btn" @click="triggerFileInput" title="Upload file model 3D">
            <span class="btn-icon">📤</span> Upload (.glb / .gltf)
          </button>
          <button class="action-btn primary-btn" @click="showAddModal = true">
            <span class="btn-icon">➕</span> Tambah Objek
          </button>
          <button class="action-btn secondary-btn" @click="showObjectList = !showObjectList">
            <span class="btn-icon">📁</span> Daftar ({{ objects.length }})
          </button>
        </template>
      </div>

      <!-- Kontrol Pencahayaan Cepat -->
      <div class="header-right">
        <div class="lighting-switch">
          <span class="lighting-label">💡 Cahaya:</span>
          <button
            :class="['light-btn', { active: lightingMode === 'bright' }]"
            @click="setLightingPreset('bright')"
          >
            ☀️ Terang
          </button>
          <button
            :class="['light-btn', { active: lightingMode === 'studio' }]"
            @click="setLightingPreset('studio')"
          >
            🏢 Studio
          </button>
          <button
            :class="['light-btn', { active: lightingMode === 'warm' }]"
            @click="setLightingPreset('warm')"
          >
            🌆 Hangat
          </button>
        </div>
      </div>
    </header>

    <!-- ================= HUD MAHASISWA ================= -->
    <template v-if="currentRole === 'mahasiswa'">
      <!-- Crosshair / Reticle di Tengah Layar -->
      <div class="student-reticle" :class="{ 'reticle-active': nearbyObject !== null }"></div>

      <!-- Prompt Interaksi Saat Mendekati Bukti -->
      <div
        v-if="nearbyObject && !inspectedDossierObject"
        class="interaction-prompt"
        @click="openDossier(nearbyObject)"
      >
        <div class="key-badge">E</div>
        <div class="prompt-text">
          <span class="prompt-action">Periksa Bukti (Klik / Tekan E)</span>
          <span class="prompt-title">{{ nearbyObject.name }}</span>
        </div>
      </div>

      <!-- Kartu Progress Investigasi Mahasiswa (Kanan Atas) -->
      <div class="student-progress-card">
        <div class="progress-title-row">
          <span class="progress-label">🕵️ Progres Penyelidikan</span>
          <span class="progress-ratio">{{ inspectedCount }} / {{ objects.length }}</span>
        </div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: `${objects.length > 0 ? (inspectedCount / objects.length) * 100 : 0}%` }"
          ></div>
        </div>
        <span class="progress-hint">
          {{
            inspectedCount === objects.length
              ? '🎉 Semua bukti kasus telah lengkap diperiksa!'
              : 'Dekati meja dan periksa objek bukti dengan menekan [E]'
          }}
        </span>
      </div>

      <!-- Bar Panduan Navigasi Berjalan (Bawah) -->
      <footer class="hud-footer">
        <div class="instruction-pill student-pill">
          <span>⌨️ <b>W, A, S, D:</b> Berjalan Berkeliling</span>
          <span>🖱️ <b>Tahan & Geser Mouse:</b> Arahkan Pandangan</span>
          <span>🔍 <b>Tekan [E] / Klik:</b> Periksa Bukti Kasus</span>
        </div>
      </footer>
    </template>

    <!-- ================= HUD DOSEN ================= -->
    <template v-if="currentRole === 'dosen'">
      <!-- Gizmo Mode Switcher -->
      <div v-if="selectedObject" class="gizmo-mode-bar">
        <span class="gizmo-label">Mode Pengatur:</span>
        <button
          :class="['mode-btn', { active: transformMode === 'translate' }]"
          @click="transformMode = 'translate'"
        >
          ↔️ Geser
        </button>
        <button
          :class="['mode-btn', { active: transformMode === 'rotate' }]"
          @click="transformMode = 'rotate'"
        >
          🔄 Putar
        </button>
        <button
          :class="['mode-btn', { active: transformMode === 'scale' }]"
          @click="transformMode = 'scale'"
        >
          🔲 Skala
        </button>
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
          <button class="close-btn" @click="selectedId = null" title="Tutup">✕</button>
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
              <button class="mini-snap-btn" @click="snapToTable" title="Ratakan tepat di atas meja">
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
                min="0.2"
                max="3.0"
                step="0.1"
                :value="selectedObject.scale[0]"
                @input="updateUniformScale(Number(($event.target as HTMLInputElement).value))"
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
            <button class="action-btn secondary-btn" @click="duplicateSelectedObject">
              📋 Salin Objek
            </button>
            <button class="action-btn danger-btn" @click="deleteSelectedObject">
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
          <span>🎯 <b>Klik Objek:</b> Geser & Atur Bukti</span>
          <span>📥 <b>Drag & Drop:</b> Upload File .glb Langsung</span>
        </div>
      </footer>
    </template>

    <!-- ================= MODAL DOSSIER BUKTI MAHASISWA ================= -->
    <div v-if="inspectedDossierObject" class="modal-backdrop" @click.self="closeDossier">
      <div class="dossier-card">
        <div class="dossier-header">
          <div class="dossier-badge-row">
            <span class="dossier-type-tag">{{ inspectedDossierObject.type.toUpperCase() }}</span>
            <span
              :class="[
                'dossier-status-tag',
                inspectedDossierObject.isInspected ? 'verified-tag' : 'pending-tag',
              ]"
            >
              {{ inspectedDossierObject.isInspected ? '✓ TERVERIFIKASI' : '⏳ BELUM DIPERIKSA' }}
            </span>
          </div>
          <h2>{{ inspectedDossierObject.name }}</h2>
          <button class="close-btn" @click="closeDossier">✕</button>
        </div>

        <div class="dossier-content">
          <!-- Deskripsi Umum -->
          <div class="dossier-info-block">
            <h4>Keterangan Fisik Barang Bukti</h4>
            <p>{{ inspectedDossierObject.desc }}</p>
          </div>

          <!-- Catatan / Arahan Khusus Dosen -->
          <div class="dossier-notes-block">
            <div class="notes-header">
              <span class="notes-icon">👨‍🏫</span>
              <h4>Catatan & Arahan Dosen Pembimbing:</h4>
            </div>
            <p class="notes-body">
              {{
                inspectedDossierObject.notes ||
                'Tidak ada catatan khusus yang ditambahkan oleh dosen untuk barang bukti ini.'
              }}
            </p>
          </div>

          <!-- Posisi & Koordinat Bukti di TKP -->
          <div class="dossier-meta-row">
            <span>📍 Koordinat TKP:</span>
            <code>X: {{ inspectedDossierObject.position[0] }} | Y: {{ inspectedDossierObject.position[1] }} | Z: {{ inspectedDossierObject.position[2] }}</code>
          </div>

          <!-- Tombol Tindakan Mahasiswa -->
          <div class="dossier-footer-actions">
            <button
              :class="[
                'action-btn',
                inspectedDossierObject.isInspected ? 'verified-action-btn' : 'primary-btn',
              ]"
              @click="toggleInspected(inspectedDossierObject)"
            >
              <span v-if="inspectedDossierObject.isInspected">✓ Sudah Terverifikasi (Klik untuk Batal)</span>
              <span v-else>🔍 Tandai Selesai Diperiksa</span>
            </button>
            <button class="action-btn secondary-btn" @click="closeDossier">
              Tutup Berkas (ESC)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL TAMBAH OBJEK (DOSEN) ================= -->
    <div v-if="showAddModal && currentRole === 'dosen'" class="modal-backdrop" @click.self="showAddModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>Tambah Objek ke Ruangan</h2>
            <p>Upload model 3D buatan Anda sendiri atau pilih dari objek preset</p>
          </div>
          <button class="close-btn" @click="showAddModal = false">✕</button>
        </div>

        <div class="modal-upload-zone" @click="triggerFileInput">
          <span class="upload-zone-icon">☁️</span>
          <div class="upload-zone-text">
            <h4>Klik untuk Upload atau Drag & Drop Model 3D</h4>
            <p>Mendukung format <b>.glb</b>, <b>.gltf</b>, dan <b>.obj</b> (Otomatis ditaruh di meja)</p>
          </div>
          <button class="action-btn upload-btn mini-upload-btn">Pilih File</button>
        </div>

        <div v-if="uploadError" class="modal-error-alert">
          ⚠️ {{ uploadError }}
        </div>

        <div class="modal-divider">
          <span>ATAU PILIH PRESET BAWAAN</span>
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

    <!-- Loading Indicator Saat Uploading Model -->
    <div v-if="isUploading" class="upload-loading-overlay">
      <div class="loading-box">
        <div class="spinner"></div>
        <h4>{{ uploadProgressText }}</h4>
        <p>Model sedang diproses dan dioptimasi untuk meja 3D...</p>
      </div>
    </div>

    <!-- Drawer Daftar Objek Dosen -->
    <div v-if="showObjectList && currentRole === 'dosen'" class="object-list-drawer">
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

/* ================= HUD MAHASISWA ================= */
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
  from { transform: translate(-50%, -50%) scale(1); }
  to { transform: translate(-50%, -50%) scale(1.25); }
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
}

.progress-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 12px;
  font-weight: 700;
  color: #cbd5e1;
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

.student-pill {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(56, 189, 248, 0.3);
}

/* ================= MODAL DOSSIER INVESTIGASI ================= */
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

/* Catatan Dosen di Inspector */
.notes-group {
  border-color: rgba(99, 102, 241, 0.3);
}

.group-hint {
  font-size: 11px;
  color: #94a3b8;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.dosen-notes-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 12px;
  padding: 8px 10px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.4;
}
.dosen-notes-input:focus {
  outline: none;
  border-color: #6366f1;
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
.inspector-actions button {
  width: 100%;
  justify-content: center;
}

/* ================= MODAL TAMBAH OBJEK ================= */
.modal-backdrop {
  position: absolute;
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
  .inspector-card,
  .student-progress-card {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
  .instruction-pill {
    display: none;
  }
}
</style>