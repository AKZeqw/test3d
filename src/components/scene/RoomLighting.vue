<script setup lang="ts">
import type { LightingMode } from '../../types/investigation'

defineProps<{
  lightingMode: LightingMode
  ambientIntensity: number
  directionalIntensity: number
  hemisphereIntensity: number
}>()
</script>

<template>
  <!-- ================= TATA CAHAYA RUANGAN (ADAPTIF SIANG/MALAM) ================= -->
  <TresAmbientLight
    :intensity="ambientIntensity"
    :color="lightingMode === 'night' ? '#1e1b4b' : '#ffffff'"
  />
  <TresHemisphereLight
    :args="[
      lightingMode === 'night' ? '#38bdf8' : '#f8fafc',
      lightingMode === 'night' ? '#0f172a' : '#64748b',
      hemisphereIntensity,
    ]"
  />
  <TresDirectionalLight
    :position="[7, 12, 6]"
    :intensity="directionalIntensity"
    cast-shadow
    :shadow-bias="-0.0001"
    :shadow-normal-bias="0.025"
    :color="lightingMode === 'night' ? '#93c5fd' : '#ffffff'"
  />
  <TresDirectionalLight
    :position="[-7, 9, -5]"
    :intensity="directionalIntensity * 0.5"
    :color="lightingMode === 'night' ? '#1e293b' : '#e0f2fe'"
  />
  <TresSpotLight
    :position="[-0.5, 6.5, -1.5]"
    :intensity="lightingMode === 'night' ? 6.5 : 3.0"
    :angle="0.85"
    :penumbra="0.6"
    :color="lightingMode === 'night' ? '#fef08a' : '#fffbeb'"
    cast-shadow
    :shadow-bias="-0.0001"
    :shadow-normal-bias="0.025"
  />
  <TresPointLight
    :position="[-3, 2.5, -2]"
    :intensity="lightingMode === 'night' ? 2.5 : 1.5"
    :color="lightingMode === 'night' ? '#f59e0b' : '#38bdf8'"
  />
  <TresPointLight
    :position="[3, 2.5, 2]"
    :intensity="lightingMode === 'night' ? 1.8 : 1.2"
    color="#fbbf24"
  />
</template>
