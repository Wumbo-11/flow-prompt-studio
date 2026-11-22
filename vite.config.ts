import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Path relatif biar hasil build gampang dibungkus Capacitor (file://) nanti.
  base: './',
  // Izinkan host tunnel (Cloudflare) mengakses server preview/dev.
  server: { allowedHosts: true },
  preview: { allowedHosts: true },
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Flow Prompt Studio',
        short_name: 'FlowPrompt',
        description: 'Bikin prompt video Google Flow dari gambar + preset, dengan penanda objek kustom.',
        theme_color: '#0b1020',
        background_color: '#0b1020',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Mode development sengaja dipakai: plugin terser workbox-build
        // tidak bisa jalan di environment Android/Termux (worker gagal exit).
        mode: 'development',
        inlineWorkboxRuntime: true,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})
