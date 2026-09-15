# 🔍 CrimeScene 3D - Virtual Investigation Room & Gamification Platform

Aplikasi web simulasi 3D interaktif berbasis **Vue 3**, **TresJS / Three.js**, dan **Google Gemini Generative AI** yang dirancang untuk pembelajaran, gamifikasi, dan simulasi penyelidikan Tempat Kejadian Perkara (TKP).

---

## 🌟 Fitur Utama

### 1. 🤖 AI Room Generator (Powered by Google Gemini)
- **Deduksi Kriminalitas Otomatis**: Cukup berikan brief kasus singkat (misal: *"pembunuhan di kantor"* atau *"sabotase di lab kimia"*), Gemini AI akan secara cerdas mendeduksi alur cerita kriminal, motif, profil korban, dan suasana TKP.
- **Perancangan TKP 3D Utuh**:
  - Penataan perabotan dan furniture 3D realistis (meja eksekutif, rak buku, lemari arsip, laptop, lampu meja).
  - Penyebaran barang bukti kunci, petunjuk tersembunyi, dan *red herring* (pengecoh).
  - Efek forensik: siluet kapur posisi korban, genangan noda darah, serta marker bukti kuning (#1 s/d #5).
  - Penyesuaian pencahayaan dramatis otomatis (mode malam/TKP).
- **Fleksibilitas API Key**: Key tersimpan aman di browser (`localStorage`) atau via file konfigurasi `.env.local`.

### 2. 👥 Sistem Role Ganda

#### 👨‍🏫 Mode Dosen (Creator & Instruktur)
- **Kamera Orbit 360°**: Rotasi dan zoom bebas ke seluruh penjuru ruangan.
- **3D Transform Gizmo**: Geser (*translate*), putar (*rotate*), dan ubah ukuran (*scale*) objek 3D secara presisi.
- **Upload Model 3D Sendiri**: Dukungan *drag & drop* atau file picker untuk format `.glb`, `.gltf`, dan `.obj`.
- **Drawer Daftar Objek & Inspektur**: Atur nama, deskripsi, koordinat numerik, warna geometri, serta tuliskan catatan/arahan instruktur khusus untuk mahasiswa.

#### 👨‍🎓 Mode Mahasiswa (Investigator / Penyelidik)
- **First-Person View (FPV)**: Berjalan langsung di dalam TKP pada ketinggian pandangan mata manusia (*eye-level* 1.7m) dengan deteksi tabrakan dinding & meja.
- **Kontrol Navigasi Halus**: Gerakan berjalan menggunakan tombol `W`, `A`, `S`, `D` dan pandangan bebas via mouse drag.
- **Raycasting Interaktif**: Reticle crosshair dinamis yang mendeteksi saat mendekati barang bukti, memunculkan prompt `[E] Periksa Bukti`.
- **Dossier Bukti Digital**: Modal berkas interaktif untuk meneliti detail fisik, koordinat TKP, catatan rahasia dosen, dan menandai status verifikasi bukti.

### 3. 🦴 Character Rigging Studio & Animation Controller
- **Skeletal Joints Visualizer**: Visualisasi struktur sendi dan kerangka tulang rigging 3D real-time (44 bones via `SkeletonHelper`).
- **41 Klip Animasi**: Pilihan gerakan lengkap (Pose Siaga, Selidiki TKP, Menjelaskan Temuan, Menyimak Saksi, Berjalan, Berlari, Duduk di Meja, Jongkok, dll.).
- **Playback Controller**: Slider kecepatan gerak (0.5x – 2.0x), tombol jeda/lanjut, dan switch avatar (Detektif Alex 👨‍💼 / Detektif Maya 👩‍💼).

### 4. 💡 Tata Cahaya Adaptif (Lighting Presets)
- Pilihan mode pencahayaan cepat: **Terang (Daylight)**, **Studio**, **Hangat (Warm)**, dan **Malam (Dramatic Night)**.
- Saklar toggle visibilitas meja laboratorium dan grid garis bantu lantai.

---

## 🏗️ Struktur Arsitektur Proyek

Kode telah dimodularisasi menjadi komponen independen sesuai fungsinya:

```
src/
├── types/
│   ├── investigation.ts        # Interface Objek Investigasi, Role, Preset, Lighting
│   ├── aiRoom.ts               # Interface Opsi, Preview, Step, dan Statistik AI Room
│   └── characterRig.ts         # Interface Model Karakter & Preset Animasi
├── constants/
│   └── initialObjects.ts       # Objek bawaan ruangan & template preset bukti
├── utils/
│   └── threeModelBuilders.ts   # Builder model prosedural Three.js (Meja, Laptop, Kapur, Darah, dll.)
├── services/
│   └── geminiService.ts        # Handler REST API Google Gemini AI
├── composables/
│   ├── useLighting.ts          # State & kontrol pencahayaan ruangan
│   ├── useCharacterRigging.ts  # Loading model GLTF, skeletal joints, animation mixer
│   ├── useStudentControls.ts   # Logika navigasi WASD, mouse look, raycasting, dossier
│   └── useAIRoomGenerator.ts   # State wizard 4-langkah, kalkulasi preview, penerapan ke 3D
├── components/
│   ├── modals/
│   │   ├── AIRoomGeneratorModal.vue  # Dialog wizard AI Room Generator & setting API key
│   │   ├── CharacterRiggingModal.vue # Panel studio skeletal rigging & controller animasi
│   │   ├── StudentDossierModal.vue   # Modal berkas dossier barang bukti mahasiswa
│   │   └── AddObjectModal.vue        # Modal upload 3D & picker preset objek
│   ├── hud/
│   │   ├── HudHeader.vue             # Header navbar, role switcher, lighting & grid switch
│   │   ├── HudStudent.vue            # Crosshair reticle, kartu progres, panduan kontrol
│   │   └── HudLecturer.vue           # Gizmo mode switcher, drawer objek, inspector panel
│   ├── scene/
│   │   ├── RoomArchitecture.vue      # Lantai, dinding, papan kasus, lampu plafon, meja
│   │   ├── RoomLighting.vue          # Tata cahaya ambient, hemisphere, spot, point lights
│   │   ├── RiggedCharacter.vue       # Primitive model detektif 3D & SkeletonHelper
│   │   └── DynamicObject.vue         # Renderer objek interaktif dengan seleksi highlight
│   └── InvestigationRoom.vue         # Komponen orkestrator utama (~540 baris)
```

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- **Node.js**: Versi 18.x atau lebih baru
- **npm** atau **yarn**

### 2. Kloning & Instalasi Dependensi
```bash
git clone https://github.com/AKZeqw/test3d.git
cd test3d
npm install
```

### 3. Konfigurasi Google Gemini API Key (Opsional)
Salin file `.env.example` menjadi `.env.local` lalu masukkan API Key Anda:
```bash
cp .env.example .env.local
```
Isi file `.env.local`:
```env
VITE_GEMINI_API_KEY=AIzaSy...
```
*(Catatan: Anda juga dapat langsung menempelkan API Key di UI web browser melalui panel **AI Generate Room** tanpa perlu merestart server).*

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada alamat: **`http://localhost:5173/`**

### 5. Build Produksi
```bash
npm run build
```

---

## 🎮 Panduan Kontrol & Pintasan Keyboard

| Tombol / Aksi | Mode | Fungsi |
| :--- | :--- | :--- |
| **Klik Kiri + Geser** | Dosen | Memutar sudut pandang kamera orbit 360° |
| **Scroll Mouse** | Dosen | Zoom in / Zoom out kamera |
| **Klik Objek** | Dosen | Memilih objek untuk diubah posisinya dengan Gizmo |
| **W, A, S, D / Panah** | Mahasiswa | Berjalan menjelajahi ruangan investigasi |
| **Klik Kiri + Geser** | Mahasiswa | Memutar arah pandang kepala / mata (*mouse look*) |
| **E** | Mahasiswa | Memeriksa berkas dossier barang bukti terdekat |
| **ESC** | Mahasiswa | Menutup berkas dossier |

---

## 🛠️ Tumpukan Teknologi

- **Frontend Framework**: [Vue 3](https://vuejs.org/) (`<script setup>`, Composition API)
- **3D Graphics Engine**: [Three.js](https://threejs.org/) + [TresJS](https://tresjs.org/) (`@tresjs/core`, `@tresjs/cientos`)
- **Generative AI**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
- **Build Tooling**: [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)

---

## 📄 Lisensi
Hak Cipta © 2026. Dikembangkan untuk keperluan riset, gamifikasi, dan simulasi investigasi virtual.
