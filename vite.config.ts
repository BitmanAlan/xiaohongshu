import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
            ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-popover']
          }
        }
      }
    },
    define: {
      global: 'globalThis',
      // 确保环境变量能在构建时被正确替换
      'process.env.NODE_ENV': JSON.stringify(mode),
      // 如果有环境变量，在构建时替换
      ...(env.VITE_SUPABASE_URL && {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL)
      }),
      ...(env.VITE_SUPABASE_ANON_KEY && {
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      }),
    },
    envPrefix: ['VITE_', 'NEXT_PUBLIC_']
  }
})