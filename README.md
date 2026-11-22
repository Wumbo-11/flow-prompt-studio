# Flow Prompt Studio

Web app (PWA) buat bikin prompt video **Google Flow / Veo** dari gambar. Upload gambar → analisis pakai Gemini Vision → pilih preset → tandai objek → copy prompt ke Flow.

## Fitur

- Upload / drag / paste gambar (auto-kompres sebelum dikirim ke API)
- Analisis gambar pakai Gemini Vision, hasilnya bisa diedit manual
- 9 preset bawaan: Image→Video, Remove Background, Shopee Ads, Remove Object, Interactive Video, Product 360°, Teks Dinamis, Before/After, Custom
- Preset buatan sendiri (template pakai `{{IMAGE_DESCRIPTION}}`, `{{MARKERS}}`, dan variabel `{{nama}}`)
- Kanvas penanda: kotak, elips, titik — koordinat dinormalisasi ke persen
- Editor prompt live + pengaturan aspect ratio / durasi / kamera / gerakan
- Copy, unduh `.txt`, buka Flow, dan riwayat prompt (localStorage)
- Tema gelap/terang dengan toggle melayang + animasi *plop* (tersimpan lokal)
- Menu akordion: hanya satu panel terbuka per langkah, tampilan lebih ringkas
- Installable PWA, siap dibungkus APK via Capacitor/TWA

## Jalankan

```bash
pnpm install
pnpm dev
```

Buka alamat yang muncul (biasanya `http://localhost:5173`).

## Build PWA

```bash
pnpm build
pnpm preview
```

Hasil produksi ada di `dist/`. Di HP, buka lewat HTTPS lalu "Add to Home Screen" / "Install app".

## Provider AI Vision

App tidak terikat ke Gemini. Panel **Provider AI Vision** di header bisa menyimpan beberapa provider sekaligus dan memilih mana yang aktif:

| Tipe | Contoh | Base URL |
|---|---|---|
| `gemini` | Gemini 2.5 Flash | tidak perlu |
| `openai-compatible` | OpenAI, OpenRouter, Groq, CosmosAI, Pecutopus, Ollama | `https://api.openai.com/v1`, `https://openrouter.ai/api/v1`, dll |
| `anthropic` | Claude | `https://api.anthropic.com` |

Semua provider memakai endpoint chat/vision dengan gambar base64 dan menghasilkan format deskripsi yang sama, jadi preset & prompt engine tidak berubah. Model wajib yang mendukung input gambar.

Key disimpan di `localStorage` browser (tidak dikirim ke server mana pun). Tanpa key, app tetap bisa dipakai dengan menulis deskripsi gambar manual.

> Kalau nanti mau di-deploy publik, pindahkan pemanggilan API ke proxy (mis. Cloudflare Worker) supaya key tidak terekspos di client.

## Catatan

Google Flow dipakai sebagai tempat **generate video**, bukan dipanggil lewat API. App ini hanya menyusun prompt; hasilnya disalin/diunduh lalu ditempel di Flow.

## Struktur

```
src/
  components/   UI (upload, annotation canvas, preset, prompt)
  data/presets.ts   preset bawaan
  lib/          image, vision, prompt engine
  store/        zustand + persist
  types.ts
```
