import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      TanStackRouterVite({
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        routeFileIgnorePrefix: '-',
        quoteStyle: 'single',
      }),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/n8n-webhook-test': {
          target: env.VITE_N8N_URL || 'http://localhost:5678',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/n8n-webhook-test/, '/webhook-test'),
        },
        '/n8n-webhook': {
          target: env.VITE_N8N_URL || 'http://localhost:5678',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/n8n-webhook/, '/webhook'),
        },
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['@tanstack/react-router'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  }
})
