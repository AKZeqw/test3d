import type { AIOptions } from '../types/aiRoom'

export function detectScenarioTheme(briefText: string, currentTheme: string): 'office' | 'lab' | 'house' | 'warehouse' {
  const lower = (briefText || '').toLowerCase()
  if (
    lower.includes('lab') ||
    lower.includes('kimia') ||
    lower.includes('toksikologi') ||
    lower.includes('racun') ||
    lower.includes('sampel') ||
    lower.includes('virus')
  ) {
    return 'lab'
  }
  if (
    lower.includes('apartemen') ||
    lower.includes('kamar') ||
    lower.includes('hotel') ||
    lower.includes('penthouse') ||
    lower.includes('tidur')
  ) {
    return 'house'
  }
  if (
    lower.includes('gudang') ||
    lower.includes('pelabuhan') ||
    lower.includes('kontainer') ||
    lower.includes('senjata') ||
    lower.includes('peti') ||
    lower.includes('bengkel')
  ) {
    return 'warehouse'
  }
  return (currentTheme as 'office' | 'lab' | 'house' | 'warehouse') || 'office'
}

export function buildDeductivePrompt(brief: string, options: AIOptions): string {
  return `Anda adalah Master Desainer Tempat Kejadian Perkara (TKP) Kriminalitas Forensik 3D dan Ahli Narasi Investigasi Kriminal untuk game edukasi detektif.
Tugas Anda adalah merancang tata letak ruangan 3D lengkap beserta perabotan, barang bukti, petunjuk tersembunyi, dan pengecoh (red herring) berdasarkan brief investigasi dari dosen/instruktur.

BRIEF INVESTIGASI DARI DOSEN:
"""${brief || 'Buat TKP pembunuhan misterius di dalam ruangan.'}"""

KONFIGURASI PREFERENSI DOSEN:
- Tema Ruangan Pilihan: ${options.theme}
- Waktu Kejadian: ${options.timeOfDay}
- Suasana Ruangan: ${options.atmosphere}
- Sertakan Marker Bukti Kuning: ${options.includeMarkers ? 'Ya' : 'Tidak'}
- Sertakan Siluet Kapur Korban: ${options.includeVictimChalk ? 'Ya' : 'Tidak'}
- Sertakan Furniture: ${options.includeFurniture ? 'Ya' : 'Tidak'}
- Sertakan Barang Bukti: ${options.includeEvidence ? 'Ya' : 'Tidak'}
- Sertakan Petunjuk Tersembunyi: ${options.includeClues ? 'Ya' : 'Tidak'}
- Sertakan Red Herring (Pengecoh): ${options.includeRedHerrings ? 'Ya' : 'Tidak'}

PANDUAN DEDUKSI & EKSPANSI BRIEFS SINGKAT (SANGAT PENTING):
Meskipun brief dari dosen sangat singkat, minim detail, atau hanya 2-3 kata (misal "pembunuhan di kantor", "kasus racun di lab", "mayat di gudang", atau "pembunuhan di penthouse"):
1. REKONSTRUKSI KASUS: Anda WAJIB secara mandiri mengonstruksi skenario kriminalitas utuh: identitas/peran korban, motif kejahatan (finansial/audit, balas dendam, persaingan bisnis, sabotase, asmara, atau pembungkaman saksi), dan kronologi rekonstruksi kejadian yang logis.
2. TEMA OTOMATIS: Tentukan tema yang paling sesuai ("office", "lab", "house", atau "warehouse").
3. JUMLAH OBJEK: Hasilkan antara 12 hingga 18 objek ruangan 3D yang saling terkait dalam satu jalinan cerita investigasi yang solid.
4. KELENGKAPAN KATEGORI:
   - Furniture ('furniture'): Perabotan utama (meja kerja, lemari arsip, rak buku, kursi) yang menata suasana TKP.
   - Barang Bukti Kunci ('evidence'): Senjata pembunuh, racun, laptop menyala dengan file transaksi/email terakhir, noda darah, siluet kapur korban.
   - Petunjuk Tersembunyi ('clue'): Sobekan kertas kode brankas, jejak sepatu/lumpur, flashdisk tersembunyi, memo rahasia, dsb.
   - Pengecoh Forensik ('red_herring'): Objek yang tampak mencurigakan bagi penyidik tapi ternyata tidak bersalah (botol obat resep pribadi, berkas legal biasa, cangkir kopi dingin).
   - Penanda Bukti Kuning: Tenda nomor forensik #1 sampai #5 ('evidence_marker_1' s/d 'evidence_marker_5') diletakkan tepat di samping bukti-bukti paling krusial.
5. CATATAN FORENSIK ILMIAH ('notes'): Setiap objek WAJIB memiliki catatan forensik mendalam yang menggunakan istilah ilmiah (uji luminol, sidik jari laten serbuk perak, residu mesiu balistik, timestamps digital, uji spektrometri toksikologi, dsb.) yang akan diinspeksi oleh mahasiswa/penyidik.

PANDUAN SPASIAL & KOORDINAT 3D:
- Ruangan 10m x 10m: Batas koordinat X: [-4.5, 4.5], Z: [-4.5, 4.5].
- Lantai berada di Y = 0.
- Perabotan lantai (seperti meja, rak buku, lemari arsip, ranjang) HARUS berada di lantai (Y = 0).
- Objek di atas meja kerja: Y = 0.765 (sejajar permukaan meja).
- Noda darah dan garis siluet kapur korban: Y = 0.008 (menempel tepat di atas lantai tanpa clipping).
- Evidence Marker: Y = 0.01 di lantai atau Y = 0.77 di meja.

TIPE MODEL (customModelType):
- "executive_desk": Meja eksekutif kayu mahoni jati dengan laci & alas kulit.
- "laptop": Laptop terbuka dengan layar bercahaya.
- "fallen_chair": Kursi kerja eksekutif tumbang di lantai.
- "chalk_outline": Garis siluet kapur korban di lantai.
- "blood_puddle": Genangan darah forensik dengan cipratan satelit.
- "bookshelf": Rak buku kayu tinggi.
- "filing_cabinet": Lemari arsip logam 4 laci terbuka.
- "evidence_marker_1", "evidence_marker_2", "evidence_marker_3", "evidence_marker_4", "evidence_marker_5": Tenda nomor forensik kuning.
- "none": Objek standar dengan geometri Three.js (box, cylinder, sphere, octahedron).

FORMAT OUTPUT HARUS BERUPA JSON VALID SESUAI SKEMA INI (TANPA TEKS PEMBUKA/PENUTUP):
{
  "theme": "office" | "lab" | "house" | "warehouse",
  "timeOfDay": "${options.timeOfDay}",
  "atmosphere": "${options.atmosphere}",
  "caseTitle": "Judul Kasus Menarik & Dramatis",
  "roomSummary": "Rekonstruksi naratif lengkap kasus: latar belakang korban, kronologi kejadian, motif kejahatan, dan alur forensik yang dirancang AI",
  "items": [
    {
      "name": "Nama Objek Lengkap",
      "desc": "Deskripsi visual objek yang terlihat di TKP",
      "notes": "Catatan forensik rahasia ilmiah yang terungkap saat objek diinspeksi oleh penyidik",
      "category": "furniture" | "evidence" | "clue" | "red_herring",
      "type": "box" | "cylinder" | "sphere" | "octahedron" | "custom_model",
      "customModelType": "executive_desk" | "laptop" | "fallen_chair" | "chalk_outline" | "blood_puddle" | "bookshelf" | "filing_cabinet" | "evidence_marker_1" | "evidence_marker_2" | "evidence_marker_3" | "evidence_marker_4" | "evidence_marker_5" | "none",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "color": "#1e293b",
      "roughness": 0.5,
      "metalness": 0.1,
      "isKey": false,
      "locationBadge": "Di Atas Meja" | "Di Lantai TKP" | "Di Rak Buku"
    }
  ]
}`
}

export async function callGeminiGenerate(apiKey: string, promptText: string): Promise<{ text: string; model: string }> {
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-pro-latest',
  ]
  let lastError: any = null

  // 1. Coba model dari daftar prioritas
  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`
        if (res.status === 404 || errMsg.includes('not found') || errMsg.includes('no longer available')) {
          lastError = new Error(`Model ${model}: ${errMsg}`)
          continue
        }
        throw new Error(`Gemini API (${model}): ${errMsg}`)
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new Error(`Respons Gemini (${model}) kosong`)
      }
      return { text, model }
    } catch (e: any) {
      lastError = e
      if (
        e.message &&
        (e.message.includes('API_KEY_INVALID') ||
          e.message.includes('API key not valid') ||
          e.message.includes('403') ||
          e.message.includes('400'))
      ) {
        throw e
      }
    }
  }

  // 2. Jika model prioritas gagal, lakukan auto-discovery melalui ListModels
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    )
    if (listRes.ok) {
      const listData = await listRes.json()
      const availableModels: string[] = (listData.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name.replace('models/', ''))

      const fallbackModel =
        availableModels.find((m) => m.includes('flash') && !m.includes('image') && !m.includes('tts')) ||
        availableModels[0]

      if (fallbackModel && !candidateModels.includes(fallbackModel)) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${encodeURIComponent(apiKey)}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) return { text, model: fallbackModel }
        }
      }
    }
  } catch (discoveryErr) {
    console.warn('Model auto-discovery error:', discoveryErr)
  }

  throw lastError || new Error('Gagal menghubungi Gemini API pada semua model yang tersedia')
}
