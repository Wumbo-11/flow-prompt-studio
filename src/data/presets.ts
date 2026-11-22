import type { Preset } from '../types'

const extraVar = {
  key: 'extra',
  label: 'Catatan tambahan',
  type: 'textarea' as const,
  placeholder: 'Contoh: nuansa hangat, slow motion di detik ke-3, tanpa teks tambahan...',
  hint: 'Opsional. Ditambahkan di akhir prompt.',
}

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id: 'image-to-video',
    name: 'Image → Video',
    description: 'Ubah gambar jadi video sinematik dengan gerak halus.',
    icon: 'Sparkles',
    category: 'kreatif',
    accent: 'violet',
    builtIn: true,
    needsVision: true,
    needsAnnotation: false,
    basePrompt: `Use the uploaded image as the exact first frame: {{IMAGE_DESCRIPTION}}
Create a seamless cinematic motion from this single frame. Camera: {{camera}}. Motion style: {{motion}}. Mood: {{mood}}.
Keep the subject, colors, clothing, logo and composition consistent with the reference. Realistic physics, natural light behavior, subtle depth, micro-details (hair, fabric, reflections), 24fps film look, no morphing.
{{extra}}`,
    variables: [
      {
        key: 'camera',
        label: 'Gerakan kamera',
        type: 'select',
        options: ['Slow push-in', 'Gentle pull-back', 'Orbit / arc shot', 'Handheld follow', 'Low-angle tilt up', 'Static with parallax'],
        default: 'Slow push-in',
      },
      {
        key: 'motion',
        label: 'Gaya gerak',
        type: 'select',
        options: ['Subtle and natural', 'Slow motion', 'Energy and fast cuts', 'Dreamy floating', 'Wind and fabric movement'],
        default: 'Subtle and natural',
      },
      {
        key: 'mood',
        label: 'Mood / suasana',
        type: 'chips',
        options: ['Cinematic', 'Bright & clean', 'Moody', 'Warm golden hour', 'Neon night', 'Minimal'],
        default: 'Cinematic',
      },
      extraVar,
    ],
    negativePrompt: 'distorted face, extra limbs, flickering, warped background, text artifacts, watermark',
    suggestedSettings: { aspectRatio: '16:9', duration: '6s', camera: 'Slow push-in', motion: 'Subtle and natural' },
  },
  {
    id: 'remove-bg',
    name: 'Remove Background',
    description: 'Ganti background skin clean, tanpa halo di pinggir objek.',
    icon: 'Eraser',
    category: 'edit',
    accent: 'sky',
    builtIn: true,
    needsVision: true,
    needsAnnotation: false,
    basePrompt: `Keep the main subject from the reference image exactly as it is: {{IMAGE_DESCRIPTION}}
Replace the entire background with: {{background}}
{{location}}
Preserve fine edges (hair, fur, fabric fringes), accurate colors, and realistic contact shadows matched to the new background. Clean cutout, no halo, no gray fringe, no leftover original background, professional studio quality.
{{MARKERS}}
{{extra}}`,
    variables: [
      {
        key: 'background',
        label: 'Background baru',
        type: 'select',
        options: ['Pure white seamless', 'Soft gray studio gradient', 'Transparent checkerboard', 'Pastel color backdrop', 'Real outdoor location described below'],
        default: 'Pure white seamless',
      },
      {
        key: 'location',
        label: 'Deskripsi lokasi (kalau pilih real outdoor)',
        type: 'text',
        placeholder: 'Contoh: kafe minimalis dengan jendela besar, cahaya pagi...',
      },
      extraVar,
    ],
    negativePrompt: 'halo, gray fringe, ghosting, blurry edges, changed subject, leftover background',
    suggestedSettings: { aspectRatio: '1:1', duration: '4s', camera: 'Static', motion: 'Subtle and natural' },
  },
  {
    id: 'shopee-ads',
    name: 'Shopee Ads',
    description: 'Iklan produk vertical 9:16 ala marketplace, ada hook & CTA.',
    icon: 'ShoppingBag',
    category: 'ecommerce',
    accent: 'orange',
    builtIn: true,
    needsVision: true,
    needsAnnotation: false,
    basePrompt: `Create a vertical 9:16 e-commerce product video for Shopee / TikTok Shop.
The product is the uploaded image: {{IMAGE_DESCRIPTION}}
Open with a strong 2-second hook and bold readable text on screen: {{hook}}
Then show the product from 3 flattering angles with smooth macro close-ups. Highlight the key selling point: {{sellingPoint}}
Add a dynamic price badge and promo sticker: {{promo}}
Finish with a clear call-to-action card: {{cta}}
Style: bright clean lighting, saturated colors, fast upbeat rhythm, tidy composition, Indonesian online-shop ad aesthetic, crisp typography, no clutter.
{{extra}}`,
    variables: [
      { key: 'hook', label: 'Hook (2 detik pertama)', type: 'text', placeholder: 'Contoh: "Bisa 3 warna dalam 1 produk!"', default: 'Wajib punya sebelum kehabisan!' },
      { key: 'sellingPoint', label: 'Keunggulan produk', type: 'text', placeholder: 'Contoh: anti air, ringan, garansi 1 tahun', default: 'Bahan premium & finish rapi' },
      { key: 'promo', label: 'Promo / harga', type: 'text', placeholder: 'Contoh: Diskon 50% + gratis ongkir', default: 'Diskon 50% hari ini saja' },
      { key: 'cta', label: 'Call to action', type: 'text', placeholder: 'Contoh: Klik keranjang kuning sekarang', default: 'Checkout sekarang sebelum habis!' },
      extraVar,
    ],
    negativePrompt: 'unreadable text, misspelled words, watermark, cluttered frame, dark lighting, low resolution',
    suggestedSettings: { aspectRatio: '9:16', duration: '8s', camera: 'Handheld follow', motion: 'Energy and fast cuts' },
  },
  {
    id: 'remove-object',
    name: 'Remove Object',
    description: 'Hapus objek yang ditandai, isi area otomatis mengikuti sekitarnya.',
    icon: 'Scissors',
    category: 'edit',
    accent: 'rose',
    builtIn: true,
    needsVision: true,
    needsAnnotation: true,
    basePrompt: `Start from the reference image exactly: {{IMAGE_DESCRIPTION}}
Remove every marked object completely: {{MARKERS}}
Reconstruct the revealed areas with content-aware fill that matches the surrounding texture, perspective, lighting, shadows and depth of field. Seamless blend, no blur patch, no ghosting, no stretching, no warped edges.
Everything outside the marked areas must remain pixel-identical to the original image.
Fill behavior: {{fillStyle}}
{{extra}}`,
    variables: [
      {
        key: 'fillStyle',
        label: 'Cara mengisi area',
        type: 'select',
        options: ['Auto-match surroundings', 'Extend the floor / table surface', 'Extend the wall or sky', 'Continue the existing pattern'],
        default: 'Auto-match surroundings',
      },
      extraVar,
    ],
    negativePrompt: 'blur patch, ghost, smudge, warped lines, duplicated object, changed unmarked area',
    suggestedSettings: { aspectRatio: '1:1', duration: '4s', camera: 'Static', motion: 'Subtle and natural' },
  },
  {
    id: 'interactive-video',
    name: 'Video Interaktif',
    description: 'Video bergaya pilih opsi, split-screen, dan kartu pertanyaan.',
    icon: 'MousePointer2',
    category: 'interaktif',
    accent: 'fuchsia',
    builtIn: true,
    needsVision: true,
    needsAnnotation: false,
    basePrompt: `Create an interactive-style choose-your-path video based on the reference image: {{IMAGE_DESCRIPTION}}
Open with a friendly presenter looking into the camera, inviting the viewer to choose between: {{choiceA}} OR {{choiceB}}
Show a clean split-screen preview of both outcomes with floating tappable buttons and a subtle cursor pointer motion.
Then reveal the selected path: {{selectedPath}}
Close with a question card on screen: {{question}}
Style: bright engaging energy, clean UI overlays, large legible labels, friendly pacing, 9:16 vertical, smooth transitions.
{{extra}}`,
    variables: [
      { key: 'choiceA', label: 'Opsi A', type: 'text', placeholder: 'Contoh: Lihat versi hemat', default: 'Pilih warna A' },
      { key: 'choiceB', label: 'Opsi B', type: 'text', placeholder: 'Contoh: Lihat versi premium', default: 'Pilih warna B' },
      { key: 'selectedPath', label: 'Jalur yang dipilih', type: 'text', placeholder: 'Contoh: Tampilkan versi premium secara detail', default: 'Tampilkan kedua pilihan secara berurutan' },
      { key: 'question', label: 'Pertanyaan penutup', type: 'text', placeholder: 'Contoh: Mana yang kamu pilih?', default: 'Mana favoritmu? Komentar di bawah!' },
      extraVar,
    ],
    negativePrompt: 'confusing layout, tiny text, overlapping UI, unreadable buttons, distorted presenter',
    suggestedSettings: { aspectRatio: '9:16', duration: '10s', camera: 'Static', motion: 'Energy and fast cuts' },
  },
  {
    id: 'product-360',
    name: 'Product 360°',
    description: 'Putar produk 360 derajat seamless di studio netral.',
    icon: 'RotateCw',
    category: 'ecommerce',
    accent: 'emerald',
    builtIn: true,
    needsVision: true,
    needsAnnotation: false,
    basePrompt: `Use the reference product image: {{IMAGE_DESCRIPTION}}
Generate a smooth 360-degree turntable rotation of the exact same product.
Keep geometry, proportions, logo, label and text perfectly consistent throughout the rotation. Neutral studio background: {{background}}
Lighting: even softbox with realistic reflections on glossy parts. Product stays centered, full object always in frame, seamless loop, no wobble, no deformation.
Rotation speed: {{speed}}
{{extra}}`,
    variables: [
      {
        key: 'background',
        label: 'Background studio',
        type: 'select',
        options: ['Pure white', 'Light gray gradient', 'Soft beige', 'Dark charcoal', 'Transparent checkerboard'],
        default: 'Pure white',
      },
      {
        key: 'speed',
        label: 'Kecepatan rotasi',
        type: 'select',
        options: ['Slow and elegant', 'Medium', 'Fast showcase'],
        default: 'Slow and elegant',
      },
      extraVar,
    ],
    negativePrompt: 'deformed product, changing logo, wobble, cropped edges, inconsistent reflections',
    suggestedSettings: { aspectRatio: '1:1', duration: '6s', camera: 'Orbit / arc shot', motion: 'Subtle and natural' },
  },
  {
    id: 'text-overlay',
    name: 'Teks Dinamis',
    description: 'Masukkan teks animasi yang nempel secara natural ke scene.',
    icon: 'Type',
    category: 'kreatif',
    accent: 'amber',
    builtIn: true,
    needsVision: true,
    needsAnnotation: false,
    basePrompt: `Use the reference image as the scene: {{IMAGE_DESCRIPTION}}
Animate this headline into the scene first: {{headline}}
Then reveal this subheading: {{subheading}}
Text animation style: {{style}}
The text must be perfectly legible, follow the scene perspective and lighting, and sit naturally in the composition. Keep the original scene, subject and colors unchanged. No extra unexpected text.
{{extra}}`,
    variables: [
      { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Contoh: PERKENALAN BARU', default: 'JUDUL UTAMA' },
      { key: 'subheading', label: 'Subheading', type: 'text', placeholder: 'Contoh: Tersedia sekarang', default: 'Sub judul singkat' },
      { key: 'style', label: 'Gaya animasi teks', type: 'select', options: ['Fade & float up', 'Kinetic typewriter', 'Bold pop-in', 'Handwritten reveal', '3D extruded'], default: 'Fade & float up' },
      extraVar,
    ],
    negativePrompt: 'misspelled text, garbled letters, extra random text, low contrast, unreadable font',
    suggestedSettings: { aspectRatio: '16:9', duration: '5s', camera: 'Static with parallax', motion: 'Subtle and natural' },
  },
  {
    id: 'before-after',
    name: 'Before / After',
    description: 'Split screen dengan reveal wipe yang memuaskan.',
    icon: 'Columns2',
    category: 'edit',
    accent: 'cyan',
    builtIn: true,
    needsVision: true,
    needsAnnotation: false,
    basePrompt: `Create a split-screen transformation video.
LEFT side, labeled BEFORE: show the uploaded reference image exactly as-is: {{IMAGE_DESCRIPTION}}
RIGHT side, labeled AFTER: show {{after}}
Use a smooth dramatic reveal wipe sweeping from left to right. Both sides must share the exact same camera angle, framing and perspective so the change is easy to compare. Clean readable labels, satisfying transition, crisp detail, no flicker.
{{extra}}`,
    variables: [
      { key: 'after', label: 'Deskripsi kondisi AFTER', type: 'textarea', placeholder: 'Contoh: bangunan yang sudah dicat ulang warna putih dengan tanaman segar', default: 'Versi yang sudah selesai dan bersih' },
      extraVar,
    ],
    negativePrompt: 'different camera angle on each side, flicker, messy labels, distorted before image',
    suggestedSettings: { aspectRatio: '16:9', duration: '5s', camera: 'Static', motion: 'Slow motion' },
  },
  {
    id: 'custom',
    name: 'Custom / Kosong',
    description: 'Mulai dari deskripsi gambar + prompt bebas kamu sendiri.',
    icon: 'FileText',
    category: 'kreatif',
    accent: 'slate',
    builtIn: true,
    needsVision: true,
    needsAnnotation: true,
    basePrompt: `Reference image: {{IMAGE_DESCRIPTION}}
{{MARKERS}}
Instruction: {{instruction}}
{{extra}}`,
    variables: [
      { key: 'instruction', label: 'Instruksi utama', type: 'textarea', placeholder: 'Tulis prompt kamu sendiri di sini...', required: true },
      extraVar,
    ],
    suggestedSettings: { aspectRatio: '16:9', duration: '6s', camera: 'Slow push-in', motion: 'Subtle and natural' },
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  edit: 'Edit Gambar',
  ecommerce: 'E-commerce',
  kreatif: 'Kreatif',
  interaktif: 'Interaktif',
}
