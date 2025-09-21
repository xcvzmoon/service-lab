import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['vue', 'vue-router'],
    },
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
    },
  },

  devtools: {
    enabled: true,
  },

  telemetry: {
    enabled: false,
  },

  ssr: false,

  ignore: ['**/src-tauri/**'],

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/eslint', '@nuxt/ui'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  runtimeConfig: {
    public: {
      defaultRoute: '',
    },
  },
});
