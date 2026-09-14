<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <TresCanvas clear-color="#202020">

    <!-- Camera -->
    <TresPerspectiveCamera
      :position="[8, 6, 8]"
      :look-at="[0, 0, 0]"
    />

    <!-- Lighting -->
    <TresAmbientLight :intensity="1" />

    <TresDirectionalLight
      :position="[5, 10, 5]"
      :intensity="2"
    />

    <!-- Floor -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[10, 10]" />
      <TresMeshStandardMaterial color="#808080" />
    </TresMesh>

    <!-- Table -->
    <TresMesh :position="[0, 1, 0]">
      <TresBoxGeometry :args="[3, 0.2, 2]" />
      <TresMeshStandardMaterial color="#8B4513" />
    </TresMesh>

    <!-- Chair -->
    <TresMesh :position="[0, 0.5, 2]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial color="#444444" />
    </TresMesh>

  </TresCanvas>
</template>