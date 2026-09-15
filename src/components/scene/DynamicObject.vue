<script setup lang="ts">
import type { InvestigationObject, Role } from '../../types/investigation'

defineProps<{
  obj: InvestigationObject
  currentRole: Role
  isSelected: boolean
  isNearby: boolean
  setMeshRef: (id: string, el: any) => void
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

<template>
  <!-- Model 3D yang Diunggah (.glb, .gltf, .obj) -->
  <primitive
    v-if="obj.type === 'custom_model' && obj.modelScene"
    :object="obj.modelScene"
    :ref="(el: any) => setMeshRef(obj.id, el)"
    :position="obj.position"
    :rotation="obj.rotation"
    :scale="obj.scale"
    @click.stop="emit('select', obj.id)"
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
    @click.stop="emit('select', obj.id)"
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
        currentRole === 'dosen' && isSelected
          ? obj.color
          : currentRole === 'mahasiswa' && isNearby
            ? '#ffffff'
            : '#000000'
      "
      :emissive-intensity="
        currentRole === 'dosen' && isSelected
          ? 0.4
          : currentRole === 'mahasiswa' && isNearby
            ? 0.3
            : 0
      "
    />
  </TresMesh>
</template>
