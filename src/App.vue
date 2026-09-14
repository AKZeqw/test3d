<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <div class="app">
    <TresCanvas clear-color="#1a1a1a">
      
      <!-- Camera -->
      <TresPerspectiveCamera
        :position="[8, 6, 8]"
        :look-at="[0, 0, 0]"
      />

      <!-- Light -->
      <TresAmbientLight :intensity="1.5" />

      <TresDirectionalLight
        :position="[5, 10, 5]"
        :intensity="2"
      />

      <!-- Lantai -->
      <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
        <TresPlaneGeometry :args="[10, 10]" />
        <TresMeshStandardMaterial color="#555555" />
      </TresMesh>

      <!-- Meja -->
      <TresMesh :position="[0, 1, 0]">
        <TresBoxGeometry :args="[3, 0.2, 2]" />
        <TresMeshStandardMaterial color="#8b4513" />
      </TresMesh>

      <!-- Kursi -->
      <TresMesh :position="[0, 0.5, 2]">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#333333" />
      </TresMesh>

    </TresCanvas>
  </div>
</template>

<style>
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>