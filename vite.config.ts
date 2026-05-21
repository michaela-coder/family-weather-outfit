import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo/app-logo.png'],
      manifest: {
        name: 'Dětské oblečení podle počasí',
        short_name: 'Oblečení',
        description: 'Ranní pomocník – co mají děti obléct podle počasí',
        theme_color: '#3949AB',
        background_color: '#F5F6FF',
        display: 'standalone',
        start_url: '/',
        lang: 'cs',
        icons: [
          {
            src: 'logo/app-logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo/app-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
