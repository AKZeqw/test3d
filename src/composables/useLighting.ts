import { ref } from 'vue'
import type { LightingMode } from '../types/investigation'

export function useLighting() {
  const lightingMode = ref<LightingMode>('bright')
  const ambientIntensity = ref(1.8)
  const directionalIntensity = ref(2.4)
  const hemisphereIntensity = ref(1.4)
  const showMainTable = ref(true)

  function setLightingPreset(mode: LightingMode) {
    lightingMode.value = mode
    if (mode === 'bright') {
      ambientIntensity.value = 1.8
      directionalIntensity.value = 2.4
      hemisphereIntensity.value = 1.4
    } else if (mode === 'studio') {
      ambientIntensity.value = 1.4
      directionalIntensity.value = 2.0
      hemisphereIntensity.value = 1.0
    } else if (mode === 'warm') {
      ambientIntensity.value = 1.2
      directionalIntensity.value = 1.8
      hemisphereIntensity.value = 0.9
    } else if (mode === 'night') {
      ambientIntensity.value = 0.45
      directionalIntensity.value = 0.85
      hemisphereIntensity.value = 0.35
    }
  }

  return {
    lightingMode,
    ambientIntensity,
    directionalIntensity,
    hemisphereIntensity,
    showMainTable,
    setLightingPreset,
  }
}
