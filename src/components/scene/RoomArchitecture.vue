<script setup lang="ts">
defineProps<{
  showGridHelper: boolean
  showMainTable: boolean
}>()
</script>

<template>
  <!-- Grid Garis Lantai Opsional (Dapat diaktifkan/dinonaktifkan) -->
  <TresGridHelper
    v-if="showGridHelper"
    :args="[18, 18, '#818cf8', '#64748b']"
    :position="[0, 0.01, 0]"
  />
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, 0]" receive-shadow>
    <TresPlaneGeometry :args="[24, 24]" />
    <TresMeshStandardMaterial color="#334155" :roughness="0.4" :metalness="0.1" />
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

  <!-- ================= MEJA INVESTIGASI UTAMA (DAPAT DISEMBUNYIKAN) ================= -->
  <template v-if="showMainTable">
    <!-- Daun Meja Utama -->
    <TresMesh :position="[0, 1.2, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[4.4, 0.12, 2.4]" />
      <TresMeshStandardMaterial color="#1e293b" :roughness="0.3" :metalness="0.35" />
    </TresMesh>
    <!-- Rangka Bawah Meja (Bebas tumpang tindih) -->
    <TresMesh :position="[0, 1.12, 0]" cast-shadow>
      <TresBoxGeometry :args="[4.2, 0.04, 2.2]" />
      <TresMeshStandardMaterial color="#64748b" :roughness="0.2" :metalness="0.85" />
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
  </template>
</template>
