import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
          runtimeCaching: [
            {
              urlPattern: /^\/(api|auth)\//,
              handler: 'NetworkOnly',
            },
          ],
        },
        manifest: {
          id: '/',
          name: 'Ishwari Secondary School',
          short_name: 'IshwariSchool',
          description: 'Official Digital Portal for Ishwari Secondary School (ईश्वरी माध्यमिक विद्यालय)',
          theme_color: '#1E3A8A',
          background_color: '#0F172A',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      hmr: false,
      watch: null,
      proxy: process.env.VITE_API_URL ? {
        '/api': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
        },
      } : undefined,
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      proxy: process.env.VITE_API_URL ? {
        '/api': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
        },
      } : undefined,
    },
    build: {
      emptyOutDir: false,
      chunkSizeWarningLimit: 3500,
    },
  };
});
