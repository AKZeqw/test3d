<script setup lang="ts">
import type { Group, SkeletonHelper } from 'three'

defineProps<{
  showCharacterRig: boolean
  characterScene: Group | null
  characterPosition: [number, number, number]
  characterRotation: [number, number, number]
  characterScale: number
  showSkeletonRig: boolean
  skeletonHelperRef: SkeletonHelper | null
  setMeshRef: (id: string, el: any) => void
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()
</script>

<template>
  <!-- ================= KARAKTER RIGGED INVESTIGATOR ================= -->
  <primitive
    v-if="showCharacterRig && characterScene"
    :object="characterScene"
    :ref="(el: any) => setMeshRef('character-rig', el)"
    :position="characterPosition"
    :rotation="characterRotation"
    :scale="[characterScale, characterScale, characterScale]"
    @click.stop="emit('select')"
  />

  <!-- Visualisasi Tulang Rangka Rigging (SkeletonHelper) -->
  <primitive
    v-if="showSkeletonRig && skeletonHelperRef"
    :object="skeletonHelperRef"
  />
</template>
