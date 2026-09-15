import { ref, reactive, computed, type Ref } from 'vue'
import type { InvestigationObject, LightingMode } from '../types/investigation'
import type { AIRoomItem, AIOptions, AIStep, AIPreviewStats } from '../types/aiRoom'
import { attachCompositeModel } from '../utils/threeModelBuilders'
import {
  detectScenarioTheme,
  buildDeductivePrompt,
  callGeminiGenerate,
} from '../services/geminiService'

export function useAIRoomGenerator(
  objects: InvestigationObject[],
  showMainTable: Ref<boolean>,
  setLightingPreset: (mode: LightingMode) => void,
  selectedId: Ref<string | null>,
  uploadToast: Ref<string | null>,
  showObjectList: Ref<boolean>
) {
  const showAIGeneratorModal = ref(false)
  const aiGeneratorStep = ref<AIStep>('brief')
  const aiBrief = ref('')

  const aiOptions = reactive<AIOptions>({
    theme: 'office',
    timeOfDay: 'night',
    atmosphere: 'dark',
    applyMode: 'replace',
    applyLighting: true,
    includeMarkers: true,
    includeVictimChalk: true,
    includeFurniture: true,
    includeEvidence: true,
    includeClues: true,
    includeRedHerrings: true,
  })

  const aiGenerationProgress = ref(0)
  const aiGenerationStatusText = ref('')
  const aiGenerationLog = reactive<string[]>([])
  const aiGeneratedPreview = reactive<AIRoomItem[]>([])
  const aiPreviewFilter = ref<'all' | 'furniture' | 'evidence' | 'clue' | 'red_herring'>('all')

  let aiGenTimers: ReturnType<typeof setTimeout>[] = []

  // Gemini API Key state
  const geminiApiKey = ref<string>(
    (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : '') ||
    ((import.meta.env.VITE_GEMINI_API_KEY as string) || '')
  )
  const inputApiKey = ref(geminiApiKey.value)
  const showApiKeyConfig = ref(!geminiApiKey.value.trim())
  const showApiKeyText = ref(false)
  const apiKeyFeedback = ref('')

  const aiCaseTitle = ref('')
  const aiRoomSummary = ref('')
  const aiGenerationError = ref(false)
  const aiGenerationErrorMessage = ref('')

  function saveApiKey() {
    const trimmed = inputApiKey.value.trim()
    geminiApiKey.value = trimmed
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed)
      apiKeyFeedback.value = '✅ API Key berhasil disimpan di browser (localStorage)!'
    } else {
      localStorage.removeItem('gemini_api_key')
      apiKeyFeedback.value = '⚠️ API Key dihapus (Key diperlukan untuk membuat ruangan)'
    }
    setTimeout(() => {
      apiKeyFeedback.value = ''
    }, 3500)
  }

  function clearApiKey() {
    inputApiKey.value = ''
    geminiApiKey.value = ''
    localStorage.removeItem('gemini_api_key')
    apiKeyFeedback.value = '🗑️ API Key dihapus'
    setTimeout(() => {
      apiKeyFeedback.value = ''
    }, 3500)
  }

  function openAIGenerator() {
    showAIGeneratorModal.value = true
    aiGeneratorStep.value = 'brief'
    aiBrief.value = ''
    aiOptions.theme = 'office'
    aiOptions.atmosphere = 'dark'
    aiOptions.timeOfDay = 'night'
    aiOptions.applyMode = 'replace'
    aiOptions.applyLighting = true
    aiOptions.includeMarkers = true
    aiOptions.includeVictimChalk = true
    aiOptions.includeFurniture = true
    aiOptions.includeEvidence = true
    aiOptions.includeClues = true
    aiOptions.includeRedHerrings = true
    aiGenerationProgress.value = 0
    aiGenerationStatusText.value = ''
    aiGenerationLog.splice(0)
    aiGeneratedPreview.splice(0)
    aiPreviewFilter.value = 'all'
    aiRoomSummary.value = ''
    aiCaseTitle.value = ''
    aiGenerationError.value = false
    aiGenerationErrorMessage.value = ''
    inputApiKey.value = geminiApiKey.value
    showApiKeyConfig.value = !geminiApiKey.value.trim()
  }

  function closeAIGenerator() {
    cancelAIGeneration()
    showAIGeneratorModal.value = false
  }

  function cancelAIGeneration() {
    aiGenTimers.forEach((t) => clearTimeout(t))
    aiGenTimers = []
  }

  function goToAIStep(step: AIStep) {
    aiGeneratorStep.value = step
  }

  function goToOptionsFromBrief() {
    const detected = detectScenarioTheme(aiBrief.value, aiOptions.theme)
    aiOptions.theme = detected
    goToAIStep('options')
  }

  async function startAIGeneration() {
    aiGeneratorStep.value = 'generating'
    aiGenerationProgress.value = 5
    aiGenerationLog.splice(0)
    aiRoomSummary.value = ''
    aiCaseTitle.value = ''
    aiGenerationError.value = false
    aiGenerationErrorMessage.value = ''
    cancelAIGeneration()

    const activeKey = (geminiApiKey.value || '').trim()

    if (!activeKey) {
      aiGenerationError.value = true
      aiGenerationErrorMessage.value =
        'Google Gemini API Key belum diisi. Masukkan API Key Anda di Langkah 1 (Brief) atau melalui file .env.local.'
      aiGenerationStatusText.value = '❌ API Key Gemini Diperlukan'
      aiGenerationLog.push('❌ Error: API Key Google Gemini belum dikonfigurasi.')
      aiGenerationLog.push('👉 Buka Langkah 1 dan tempelkan API Key Anda di kolom Google Gemini API Key.')
      return
    }

    aiGenerationStatusText.value = '🌐 Menghubungi Google Gemini API...'
    aiGenerationLog.push('🔑 API Key terdeteksi. Memulai koneksi ke Google Gemini AI...')
    aiGenerationProgress.value = 15

    try {
      const prompt = buildDeductivePrompt(aiBrief.value, aiOptions)

      aiGenerationProgress.value = 35
      aiGenerationStatusText.value = '🧠 Gemini sedang menganalisis brief & merancang tata letak 3D...'
      aiGenerationLog.push('📤 Mengirim brief investigasi ke Google Gemini API...')

      const { text: responseText, model: usedModel } = await callGeminiGenerate(activeKey, prompt)

      aiGenerationProgress.value = 75
      aiGenerationStatusText.value = `⚡ Menerima & mengurai data TKP (${usedModel})...`
      aiGenerationLog.push(`🤖 Berhasil terhubung ke model: ${usedModel}`)
      aiGenerationLog.push('📥 Respons diterima dari Google Gemini! Melakukan deserialisasi JSON...')

      let cleanJson = responseText.trim()
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '')
      }
      const parsedData = JSON.parse(cleanJson)

      aiCaseTitle.value = parsedData.caseTitle || 'Kasus Investigasi Forensik'
      aiRoomSummary.value =
        parsedData.roomSummary || 'Rancangan TKP forensik berhasil direkonstruksi oleh Gemini AI.'
      if (parsedData.theme && ['office', 'lab', 'house', 'warehouse'].includes(parsedData.theme)) {
        aiOptions.theme = parsedData.theme
      }

      aiGenerationLog.push(`📁 Judul Kasus: ${aiCaseTitle.value}`)
      aiGenerationLog.push(`📝 Rekonstruksi: ${aiRoomSummary.value}`)

      aiGenerationProgress.value = 85
      aiGenerationStatusText.value = '📐 Memvalidasi posisi & merekatkan model komposit 3D...'

      const items: AIRoomItem[] = (parsedData.items || []).map((raw: any) => {
        const item: AIRoomItem = {
          name: String(raw.name || 'Objek TKP'),
          desc: String(raw.desc || 'Deskripsi objek TKP forensik'),
          notes: String(raw.notes || 'Belum ada catatan forensik khusus.'),
          category: ['furniture', 'evidence', 'clue', 'red_herring'].includes(raw.category)
            ? raw.category
            : 'evidence',
          type: ['box', 'octahedron', 'cylinder', 'sphere', 'custom_model'].includes(raw.type)
            ? raw.type
            : 'box',
          position:
            Array.isArray(raw.position) && raw.position.length === 3
              ? [Number(raw.position[0]), Number(raw.position[1]), Number(raw.position[2])]
              : [0, 0.5, 0],
          rotation:
            Array.isArray(raw.rotation) && raw.rotation.length === 3
              ? [Number(raw.rotation[0]), Number(raw.rotation[1]), Number(raw.rotation[2])]
              : [0, 0, 0],
          scale:
            Array.isArray(raw.scale) && raw.scale.length === 3
              ? [Number(raw.scale[0]), Number(raw.scale[1]), Number(raw.scale[2])]
              : [1, 1, 1],
          color: typeof raw.color === 'string' && raw.color.startsWith('#') ? raw.color : '#64748b',
          roughness: typeof raw.roughness === 'number' ? raw.roughness : 0.5,
          metalness: typeof raw.metalness === 'number' ? raw.metalness : 0.1,
          args:
            raw.type === 'cylinder'
              ? [0.1, 0.1, 0.3, 16]
              : raw.type === 'sphere'
              ? [0.15, 16, 16]
              : raw.type === 'octahedron'
              ? [0.2]
              : [0.5, 0.5, 0.5],
          isKey: Boolean(raw.isKey),
          locationBadge: raw.locationBadge || (raw.position[1] > 0.6 ? 'Di Atas Meja' : 'Di Lantai'),
        }

        item.position[0] = Math.min(Math.max(item.position[0], -4.6), 4.6)
        item.position[2] = Math.min(Math.max(item.position[2], -4.6), 4.6)
        if (item.position[1] < 0) item.position[1] = 0

        attachCompositeModel(item, raw.customModelType)

        return item
      })

      const filtered = items.filter((item) => {
        if (item.category === 'furniture' && !aiOptions.includeFurniture) return false
        if (item.category === 'evidence' && !aiOptions.includeEvidence) return false
        if (item.category === 'clue' && !aiOptions.includeClues) return false
        if (item.category === 'red_herring' && !aiOptions.includeRedHerrings) return false
        if (item.name.includes('Penanda Bukti') && !aiOptions.includeMarkers) return false
        if (item.name.includes('Siluet Kapur') && !aiOptions.includeVictimChalk) return false
        return true
      })

      aiGeneratedPreview.splice(0)
      filtered.forEach((item) => aiGeneratedPreview.push(item))

      aiGenerationProgress.value = 100
      aiGenerationStatusText.value = '✅ TKP Forensik Berhasil Dihasilkan oleh Gemini AI!'
      aiGenerationLog.push(`✨ Sukses! ${filtered.length} objek 3D forensik siap diterapkan ke ruangan.`)

      setTimeout(() => {
        aiGeneratorStep.value = 'preview'
      }, 700)
    } catch (err: any) {
      console.error('Gemini API generation error:', err)
      aiGenerationError.value = true
      aiGenerationErrorMessage.value = err?.message || 'Gagal menghubungi Google Gemini API'
      aiGenerationStatusText.value = '❌ Gagal Menghasilkan Ruangan'
      aiGenerationLog.push(`❌ Gemini API Error: ${err?.message || 'Gagal memanggil API'}`)
      aiGenerationLog.push('💡 Tips: Periksa koneksi internet atau batas kuota model Google AI Studio.')
    }
  }

  function applyGeneratedRoom() {
    if (aiOptions.applyMode === 'replace') {
      objects.splice(0)
      showMainTable.value = false
    }

    if (aiOptions.applyLighting) {
      const isNight = aiOptions.timeOfDay === 'night' || aiOptions.atmosphere === 'dark'
      setLightingPreset(isNight ? 'night' : 'studio')
    }

    const newObjects: InvestigationObject[] = aiGeneratedPreview.map((item, index) => ({
      id: `ai-gen-${Date.now()}-${index}`,
      name: item.name,
      desc: item.desc,
      notes: item.notes,
      isInspected: false,
      type: item.type as InvestigationObject['type'],
      position: [...item.position] as [number, number, number],
      rotation: [...item.rotation] as [number, number, number],
      scale: [...item.scale] as [number, number, number],
      color: item.color,
      roughness: item.roughness,
      metalness: item.metalness,
      args: [...item.args],
      modelScene: item.modelScene,
    }))

    newObjects.forEach((obj) => objects.push(obj))

    const primaryEvidence = newObjects.find(
      (o) =>
        o.name.toLowerCase().includes('laptop') ||
        o.name.toLowerCase().includes('darah') ||
        o.name.toLowerCase().includes('racun')
    )
    if (primaryEvidence) {
      selectedId.value = primaryEvidence.id
    } else if (newObjects.length > 0) {
      selectedId.value = newObjects[0].id
    }

    aiGeneratorStep.value = 'done'
    uploadToast.value = `✨ AI Room Generator: ${
      aiCaseTitle.value ? `"${aiCaseTitle.value}" — ` : ''
    }${newObjects.length} objek TKP berhasil diterapkan ke ruangan 3D!`

    setTimeout(() => {
      uploadToast.value = null
    }, 5000)

    setTimeout(() => {
      showAIGeneratorModal.value = false
      showObjectList.value = true
    }, 1800)
  }

  function getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      furniture: '🪑 Furniture',
      evidence: '🔬 Barang Bukti',
      clue: '🧩 Petunjuk',
      red_herring: '🎭 Red Herring',
    }
    return labels[cat] || cat
  }

  function getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      furniture: '#64748b',
      evidence: '#ef4444',
      clue: '#f59e0b',
      red_herring: '#8b5cf6',
    }
    return colors[cat] || '#64748b'
  }

  const aiPreviewStats = computed<AIPreviewStats>(() => {
    const furniture = aiGeneratedPreview.filter((i: any) => i.category === 'furniture').length
    const evidence = aiGeneratedPreview.filter((i: any) => i.category === 'evidence').length
    const clue = aiGeneratedPreview.filter((i: any) => i.category === 'clue').length
    const redHerring = aiGeneratedPreview.filter((i: any) => i.category === 'red_herring').length
    return { furniture, evidence, clue, redHerring, total: aiGeneratedPreview.length }
  })

  const filteredAiGeneratedPreview = computed(() => {
    if (aiPreviewFilter.value === 'all') return aiGeneratedPreview
    return aiGeneratedPreview.filter((item: any) => item.category === aiPreviewFilter.value)
  })

  return {
    showAIGeneratorModal,
    aiGeneratorStep,
    aiBrief,
    aiOptions,
    aiGenerationProgress,
    aiGenerationStatusText,
    aiGenerationLog,
    aiGeneratedPreview,
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
    openAIGenerator,
    closeAIGenerator,
    goToAIStep,
    goToOptionsFromBrief,
    startAIGeneration,
    applyGeneratedRoom,
    getCategoryLabel,
    getCategoryColor,
  }
}
