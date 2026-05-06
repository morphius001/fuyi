import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mercurDashboardPlugin } from '@mercurjs/dashboard-sdk'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mercurDashboardPlugin({
      medusaConfigPath: '../../packages/api/medusa-config.ts',
      backendUrl: process.env.VITE_MEDUSA_BACKEND_URL ?? 'http://127.0.0.1:9000',
      components: {
        MainSidebar: 'components/ChinaAdminSidebar.tsx',
      },
      i18n: {
        defaultLanguage: 'zhCN',
      },
    }),
  ],
})
